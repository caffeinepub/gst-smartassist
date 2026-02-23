import Array "mo:core/Array";
import Map "mo:core/Map";
import Bool "mo:core/Bool";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Text "mo:core/Text";
import Order "mo:core/Order";
import List "mo:core/List";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  module UserProfile {
    public type Plan = { #free; #premium };
    public type Role = { #user; #admin };
    public type T = {
      name : Text;
      email : Text;
      plan : Plan;
      subscriptionExpiry : ?Int;
      businessName : ?Text;
      gstin : ?Text;
      role : Role;
    };
  };

  module GstCalculation {
    public type Slab = { #slab5 : () ; #slab12 : () ; #slab18 : () ; #slab28 : () };

    public type T = {
      userEmail : Text;
      baseAmount : Float;
      gstSlab : Slab;
      isInclusive : Bool;
      gstAmount : Float;
      cgst : Float;
      sgst : Float;
      totalAmount : Float;
      timestamp : Int;
      isSaved : Bool;
    };

    public func compareByTimestampDesc(a : T, b : T) : Order.Order {
      Int.compare(b.timestamp, a.timestamp);
    };
  };

  module Invoice {
    public type T = {
      userEmail : Text;
      invoiceNumber : Text;
      customerName : Text;
      customerPhone : Text;
      itemName : Text;
      quantity : Nat;
      price : Float;
      gstSlab : GstCalculation.Slab;
      itemTotal : Float;
      gstAmount : Float;
      grandTotal : Float;
      status : Text;
      createdDate : Int;
      pdfLink : ?Text;
    };
  };

  module DueDate {
    public type Type = { #gstFiling; #advanceTax; #custom };

    public type T = {
      title : Text;
      description : Text;
      dueDate : Int;
      dueDateType : Type;
      reminderEnabled : Bool;
      notificationDate : ?Int;
      userEmail : ?Text;
    };
  };

  module LearningContent {
    public type Category = { #gstBasics; #itc; #filing };
    public type T = {
      topicTitle : Text;
      description : Text;
      category : Category;
      quizQuestion : ?Text;
      correctAnswer : ?Text;
      explanation : ?Text;
      displayOrder : Nat;
    };
  };

  module TaxTip {
    public type T = {
      title : Text;
      shortDescription : Text;
      fullContent : Text;
      isPremiumOnly : Bool;
    };
  };

  module CaLead {
    public type Status = { #pending; #assigned; #closed };

    public type T = {
      userEmail : Text;
      name : Text;
      phone : Text;
      queryDescription : Text;
      fileUpload : ?Text;
      status : Status;
      createdDate : Int;
    };
  };

  let users = Map.empty<Principal, UserProfile.T>();
  let calculations = Map.empty<Text, GstCalculation.T>();
  let invoices = Map.empty<Text, Invoice.T>();
  let dueDates = Map.empty<Text, DueDate.T>();
  let learningContent = Map.empty<Text, LearningContent.T>();
  let taxTips = Map.empty<Text, TaxTip.T>();
  let caLeads = Map.empty<Text, CaLead.T>();

  // User Profile Management Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile.T {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    users.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile.T {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    users.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile.T) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    users.add(caller, profile);
  };

  // GST Calculation Functions
  public shared ({ caller }) func createGstCalculation(userEmail : Text, baseAmount : Float, gstSlab : GstCalculation.Slab, isInclusive : Bool) : async GstCalculation.T {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create calculations");
    };

    let userOpt = users.get(caller);
    switch (userOpt) {
      case (null) {
        Runtime.trap("User profile not found");
      };
      case (?user) {
        if (user.email != userEmail) {
          Runtime.trap("Unauthorized: Can only create calculations for your own account");
        };
      };
    };

    let gstPercentage : Float = switch (gstSlab) {
      case (#slab5) { 0.05 };
      case (#slab12) { 0.12 };
      case (#slab18) { 0.18 };
      case (#slab28) { 0.28 };
    };

    let gstAmount : Float = if (isInclusive) {
      (baseAmount * gstPercentage) / (1 + gstPercentage);
    } else {
      baseAmount * gstPercentage;
    };

    let cgst : Float = gstAmount / 2.0;
    let sgst : Float = gstAmount / 2.0;
    let totalAmount : Float = if (isInclusive) {
      baseAmount;
    } else {
      baseAmount + gstAmount;
    };

    let calculation : GstCalculation.T = {
      userEmail;
      baseAmount;
      gstSlab;
      isInclusive;
      gstAmount;
      cgst;
      sgst;
      totalAmount;
      timestamp = Int.abs(Time.now());
      isSaved = false;
    };

    calculations.add(userEmail # Int.abs(Time.now()).toText(), calculation);
    calculation;
  };

  public query ({ caller }) func getCalculationsByUser(userEmail : Text) : async [GstCalculation.T] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view calculations");
    };

    let userOpt = users.get(caller);
    switch (userOpt) {
      case (null) {
        Runtime.trap("User profile not found");
      };
      case (?user) {
        if (user.email != userEmail and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own calculations");
        };
      };
    };

    calculations.values().toArray().filter(
      func(calculation) {
        Text.equal(calculation.userEmail, userEmail);
      }
    );
  };

  public shared ({ caller }) func deleteCalculation(userEmail : Text, timestamp : Int) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete calculations");
    };

    let userOpt = users.get(caller);
    switch (userOpt) {
      case (null) {
        Runtime.trap("User profile not found");
      };
      case (?user) {
        if (user.email != userEmail) {
          Runtime.trap("Unauthorized: Can only delete your own calculations");
        };
      };
    };

    let key = userEmail # timestamp.toText();
    switch (calculations.get(key)) {
      case (null) { false };
      case (?calc) {
        if (calc.userEmail != userEmail) {
          Runtime.trap("Unauthorized: Can only delete your own calculations");
        };
        calculations.remove(key);
        true;
      };
    };
  };

  // Invoice Functions
  public shared ({ caller }) func createInvoice(userEmail : Text, customerName : Text, customerPhone : Text, itemName : Text, quantity : Nat, price : Float, gstSlab : GstCalculation.Slab) : async ?Invoice.T {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create invoices");
    };

    let userOpt = users.get(caller);
    let user = switch (userOpt) {
      case (null) {
        Runtime.trap("User profile not found");
      };
      case (?u) { u };
    };

    if (user.email != userEmail) {
      Runtime.trap("Unauthorized: Can only create invoices for your own account");
    };

    let plan : UserProfile.Plan = user.plan;

    if (plan == #free) {
      let currentMonth = Int.abs(Time.now()) / 2_592_000_000_000;
      let invoiceCount = invoices.values().toArray().filter(
        func(invoice) {
          invoice.userEmail == userEmail and invoice.createdDate / 2_592_000_000_000 == currentMonth
        }
      ).size();

      if (invoiceCount >= 3) { return null };
    };

    let itemTotal = quantity.toFloat() * price;
    let gstPercentage : Float = switch (gstSlab) {
      case (#slab5) { 0.05 };
      case (#slab12) { 0.12 };
      case (#slab18) { 0.18 };
      case (#slab28) { 0.28 };
    };
    let gstAmount = itemTotal * gstPercentage;
    let grandTotal = itemTotal + gstAmount;

    let invoice : Invoice.T = {
      userEmail;
      invoiceNumber = Int.abs(Time.now()).toText();
      customerName;
      customerPhone;
      itemName;
      quantity;
      price;
      gstSlab;
      itemTotal;
      gstAmount;
      grandTotal;
      status = "active";
      createdDate = Int.abs(Time.now());
      pdfLink = null;
    };

    invoices.add(invoice.invoiceNumber, invoice);
    ?invoice;
  };

  public query ({ caller }) func getUserInvoices(userEmail : Text) : async [Invoice.T] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view invoices");
    };

    let userOpt = users.get(caller);
    switch (userOpt) {
      case (null) {
        Runtime.trap("User profile not found");
      };
      case (?user) {
        if (user.email != userEmail and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own invoices");
        };
      };
    };

    invoices.values().toArray().filter(
      func(invoice) {
        Text.equal(invoice.userEmail, userEmail);
      }
    );
  };

  public shared ({ caller }) func deleteInvoice(invoiceNumber : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete invoices");
    };

    let userOpt = users.get(caller);
    let user = switch (userOpt) {
      case (null) {
        Runtime.trap("User profile not found");
      };
      case (?u) { u };
    };

    switch (invoices.get(invoiceNumber)) {
      case (null) { false };
      case (?invoice) {
        if (invoice.userEmail != user.email and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own invoices");
        };
        invoices.remove(invoiceNumber);
        true;
      };
    };
  };

  // Due Dates Functions - Public read access for all users including guests
  public query func getUpcomingDueDates() : async [DueDate.T] {
    let now = Int.abs(Time.now());
    dueDates.values().toArray().filter(
      func(dueDate) {
        dueDate.dueDate >= now;
      }
    );
  };

  public shared ({ caller }) func createCustomReminder(title : Text, description : Text, dueDate : Int, reminderEnabled : Bool) : async DueDate.T {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create custom reminders");
    };

    let userOpt = users.get(caller);
    let userEmail = switch (userOpt) {
      case (null) {
        Runtime.trap("User profile not found");
      };
      case (?user) { user.email };
    };

    let reminder : DueDate.T = {
      title;
      description;
      dueDate;
      dueDateType = #custom;
      reminderEnabled;
      notificationDate = if (reminderEnabled) { ?(dueDate - 86_400_000_000_000) } else { null };
      userEmail = ?userEmail;
    };

    dueDates.add(userEmail # dueDate.toText(), reminder);
    reminder;
  };

  public query ({ caller }) func getUserCustomReminders() : async [DueDate.T] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view custom reminders");
    };

    let userOpt = users.get(caller);
    let userEmail = switch (userOpt) {
      case (null) {
        Runtime.trap("User profile not found");
      };
      case (?user) { user.email };
    };

    dueDates.values().toArray().filter(
      func(dueDate) {
        switch (dueDate.userEmail) {
          case (null) { false };
          case (?email) { Text.equal(email, userEmail) };
        };
      }
    );
  };

  // Learning Content Functions - Public read access for all users including guests
  public query func getLearningContentByCategory(category : LearningContent.Category) : async [LearningContent.T] {
    learningContent.values().toArray().filter(
      func(content) {
        content.category == category;
      }
    );
  };

  public query func getAllLearningContent() : async [LearningContent.T] {
    learningContent.values().toArray();
  };

  // Tax Tips Functions - Public read access, but premium content filtered based on user plan
  public query ({ caller }) func getTaxTips() : async [TaxTip.T] {
    let userOpt = users.get(caller);
    let isPremium = switch (userOpt) {
      case (null) { false };
      case (?user) { user.plan == #premium };
    };

    taxTips.values().toArray().filter(
      func(tip) {
        if (tip.isPremiumOnly) {
          isPremium;
        } else {
          true;
        };
      }
    );
  };

  // CA Leads Functions
  public shared ({ caller }) func submitCaLead(name : Text, phone : Text, queryDescription : Text, fileUpload : ?Text) : async CaLead.T {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit CA leads");
    };

    let userOpt = users.get(caller);
    let user = switch (userOpt) {
      case (null) {
        Runtime.trap("User profile not found");
      };
      case (?u) { u };
    };

    if (user.plan != #premium) {
      Runtime.trap("Unauthorized: Only Premium users can submit CA support queries");
    };

    let lead : CaLead.T = {
      userEmail = user.email;
      name;
      phone;
      queryDescription;
      fileUpload;
      status = #pending;
      createdDate = Int.abs(Time.now());
    };

    caLeads.add(user.email # Int.abs(Time.now()).toText(), lead);
    lead;
  };

  public query ({ caller }) func getUserCaLeads() : async [CaLead.T] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view CA leads");
    };

    let userOpt = users.get(caller);
    let userEmail = switch (userOpt) {
      case (null) {
        Runtime.trap("User profile not found");
      };
      case (?user) { user.email };
    };

    caLeads.values().toArray().filter(
      func(lead) {
        Text.equal(lead.userEmail, userEmail);
      }
    );
  };

  public query ({ caller }) func getAllCaLeads() : async [CaLead.T] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all CA leads");
    };

    caLeads.values().toArray();
  };

  public shared ({ caller }) func updateCaLeadStatus(leadKey : Text, newStatus : CaLead.Status) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update CA lead status");
    };

    switch (caLeads.get(leadKey)) {
      case (null) { false };
      case (?lead) {
        let updatedLead : CaLead.T = {
          userEmail = lead.userEmail;
          name = lead.name;
          phone = lead.phone;
          queryDescription = lead.queryDescription;
          fileUpload = lead.fileUpload;
          status = newStatus;
          createdDate = lead.createdDate;
        };
        caLeads.add(leadKey, updatedLead);
        true;
      };
    };
  };

  // Admin Functions
  public shared ({ caller }) func preloadStatutoryDueDates() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can preload statutory due dates");
    };

    let gstr1Monthly : DueDate.T = {
      title = "GSTR-1 Monthly Filing";
      description = "Monthly return for outward supplies";
      dueDate = 1735689600000000000;
      dueDateType = #gstFiling;
      reminderEnabled = true;
      notificationDate = ?1735603200000000000;
      userEmail = null;
    };

    let gstr3bMonthly : DueDate.T = {
      title = "GSTR-3B Monthly Filing";
      description = "Monthly summary return";
      dueDate = 1736294400000000000;
      dueDateType = #gstFiling;
      reminderEnabled = true;
      notificationDate = ?1736208000000000000;
      userEmail = null;
    };

    dueDates.add("statutory_gstr1_monthly", gstr1Monthly);
    dueDates.add("statutory_gstr3b_monthly", gstr3bMonthly);
  };

  public shared ({ caller }) func preloadLearningContent() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can preload learning content");
    };

    let content1 : LearningContent.T = {
      topicTitle = "Introduction to GST";
      description = "Learn the basics of Goods and Services Tax in India";
      category = #gstBasics;
      quizQuestion = ?"What does GST stand for?";
      correctAnswer = ?"Goods and Services Tax";
      explanation = ?"GST is a comprehensive indirect tax on manufacture, sale and consumption of goods and services";
      displayOrder = 1;
    };

    learningContent.add("content_1", content1);
  };

  public shared ({ caller }) func preloadTaxTips() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can preload tax tips");
    };

    let tip1 : TaxTip.T = {
      title = "Claim Input Tax Credit";
      shortDescription = "Maximize your ITC claims to reduce tax liability";
      fullContent = "Ensure all invoices are properly documented and filed within the prescribed time limits to claim full input tax credit";
      isPremiumOnly = false;
    };

    let tip2 : TaxTip.T = {
      title = "Advanced Tax Planning Strategies";
      shortDescription = "Expert strategies for tax optimization";
      fullContent = "Detailed analysis of tax planning opportunities including composition scheme benefits, reverse charge mechanism optimization, and strategic invoice timing";
      isPremiumOnly = true;
    };

    taxTips.add("tip_1", tip1);
    taxTips.add("tip_2", tip2);
  };
};
