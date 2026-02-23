import { Slab } from '../backend';

export function gstSlabToPercentage(slab: Slab): number {
  switch (slab) {
    case Slab.slab5:
      return 5;
    case Slab.slab12:
      return 12;
    case Slab.slab18:
      return 18;
    case Slab.slab28:
      return 28;
    default:
      return 0;
  }
}

export function percentageToGstSlab(percentage: number): Slab {
  switch (percentage) {
    case 5:
      return Slab.slab5;
    case 12:
      return Slab.slab12;
    case 18:
      return Slab.slab18;
    case 28:
      return Slab.slab28;
    default:
      return Slab.slab18;
  }
}

export function getSlabFromEnum(slab: Slab): number {
  return gstSlabToPercentage(slab);
}

export function getEnumFromSlab(percentage: number): Slab {
  return percentageToGstSlab(percentage);
}

export function calculateGst(
  baseAmount: number,
  gstPercentage: number,
  isInclusive: boolean
): {
  gstAmount: number;
  cgst: number;
  sgst: number;
  totalAmount: number;
} {
  const rate = gstPercentage / 100;

  let gstAmount: number;
  let totalAmount: number;

  if (isInclusive) {
    gstAmount = (baseAmount * rate) / (1 + rate);
    totalAmount = baseAmount;
  } else {
    gstAmount = baseAmount * rate;
    totalAmount = baseAmount + gstAmount;
  }

  const cgst = gstAmount / 2;
  const sgst = gstAmount / 2;

  return {
    gstAmount: Math.round(gstAmount * 100) / 100,
    cgst: Math.round(cgst * 100) / 100,
    sgst: Math.round(sgst * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
  };
}
