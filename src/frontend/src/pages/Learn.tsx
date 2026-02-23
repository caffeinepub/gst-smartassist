import { useState } from 'react';
import { useGetAllLearningContent } from '../hooks/useQueries';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle } from 'lucide-react';
import { Category } from '../backend';
import type { T__5 } from '../backend';

export default function Learn() {
  const { data: allContent = [] } = useGetAllLearningContent();
  const { isTopicComplete, markTopicComplete, getCompletionPercentage } = useLearningProgress();

  const [selectedTopic, setSelectedTopic] = useState<T__5 | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState('');
  const [quizResult, setQuizResult] = useState<'correct' | 'incorrect' | null>(null);

  const categories = [
    { key: 'gstBasics', label: 'GST Basics', value: Category.gstBasics },
    { key: 'itc', label: 'Input Tax Credit', value: Category.itc },
    { key: 'filing', label: 'Filing', value: Category.filing },
  ];

  const getContentByCategory = (category: Category) => {
    return allContent.filter((content) => content.category === category);
  };

  const handleTopicClick = (topic: T__5) => {
    setSelectedTopic(topic);
    setShowQuiz(false);
    setQuizAnswer('');
    setQuizResult(null);
  };

  const handleCompleteAndQuiz = () => {
    if (selectedTopic) {
      markTopicComplete(selectedTopic.category, selectedTopic.topicTitle);
      if (selectedTopic.quizQuestion) {
        setShowQuiz(true);
      } else {
        setSelectedTopic(null);
      }
    }
  };

  const handleQuizSubmit = () => {
    if (selectedTopic && selectedTopic.correctAnswer) {
      if (quizAnswer.trim().toLowerCase() === selectedTopic.correctAnswer.toLowerCase()) {
        setQuizResult('correct');
      } else {
        setQuizResult('incorrect');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Learn GST</h2>
        <p className="text-muted-foreground">Master GST concepts with interactive lessons</p>
      </div>

      <Tabs defaultValue="gstBasics" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {categories.map((cat) => (
            <TabsTrigger key={cat.key} value={cat.key}>
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((cat) => {
          const categoryContent = getContentByCategory(cat.value);
          const progress = getCompletionPercentage(cat.value, categoryContent.length);

          return (
            <TabsContent key={cat.key} value={cat.key} className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Progress</CardTitle>
                    <span className="text-sm font-medium">{progress}%</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={progress} className="h-2" />
                </CardContent>
              </Card>

              <div className="grid gap-4">
                {categoryContent.map((topic) => {
                  const completed = isTopicComplete(cat.value, topic.topicTitle);
                  return (
                    <Card
                      key={topic.topicTitle}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleTopicClick(topic)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{topic.topicTitle}</CardTitle>
                          {completed ? (
                            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                          ) : (
                            <Circle className="w-6 h-6 text-muted-foreground flex-shrink-0" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{topic.description}</p>
                        {topic.quizQuestion && (
                          <Badge variant="secondary" className="mt-2">
                            Includes Quiz
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

      <Dialog open={!!selectedTopic} onOpenChange={() => setSelectedTopic(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTopic?.topicTitle}</DialogTitle>
          </DialogHeader>
          {selectedTopic && (
            <div className="space-y-4">
              {!showQuiz ? (
                <>
                  <p className="text-sm leading-relaxed">{selectedTopic.description}</p>
                  <Button onClick={handleCompleteAndQuiz} className="w-full">
                    {selectedTopic.quizQuestion ? 'Complete & Take Quiz' : 'Mark as Complete'}
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="font-medium mb-2">Quiz Question:</p>
                    <p className="text-sm">{selectedTopic.quizQuestion}</p>
                  </div>
                  <div>
                    <input
                      type="text"
                      value={quizAnswer}
                      onChange={(e) => setQuizAnswer(e.target.value)}
                      placeholder="Your answer"
                      className="w-full px-3 py-2 border rounded-md"
                      disabled={quizResult !== null}
                    />
                  </div>
                  {quizResult === null ? (
                    <Button onClick={handleQuizSubmit} className="w-full">
                      Submit Answer
                    </Button>
                  ) : (
                    <div className={`p-4 rounded-lg ${quizResult === 'correct' ? 'bg-green-50' : 'bg-red-50'}`}>
                      <p className={`font-medium ${quizResult === 'correct' ? 'text-green-700' : 'text-red-700'}`}>
                        {quizResult === 'correct' ? 'Correct!' : 'Incorrect'}
                      </p>
                      {selectedTopic.explanation && (
                        <p className="text-sm mt-2">{selectedTopic.explanation}</p>
                      )}
                      <Button onClick={() => setSelectedTopic(null)} className="mt-4 w-full">
                        Close
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
