'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Clock, 
  BarChart, 
  CheckCircle, 
  ArrowRight, 
  Edit, 
  Trash, 
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import useAuthStore from '@/store/auth-store';
import useQuizStore from '@/store/quiz-store';

export default function QuizCard({ quiz, onDelete }) {
  const [isLoading, setIsLoading] = useState(false);
  const { isAdmin } = useAuthStore();
  const { startQuiz } = useQuizStore();
  
  // Format date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  // Handle starting the quiz
  const handleStartQuiz = async () => {
    try {
      setIsLoading(true);
      await startQuiz(quiz.id);
      window.location.href = `/user/quizzes/${quiz.id}/take`;
    } catch (error) {
      console.error('Failed to start quiz:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get badge color based on status
  const getBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'completed':
        return 'success';
      case 'expired':
        return 'destructive';
      default:
        return 'outline';
    }
  };
  
  // Determine quiz action based on user role and quiz status
  const renderQuizAction = () => {
    if (isAdmin) {
      return (
        <div className="flex space-x-2">
          <Link href={`/admin/quizzes/${quiz.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Trash className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the quiz
                  and all associated responses.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(quiz.id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    }
    
    // For regular users
    if (quiz.user_response) {
      return (
        <Link href={`/user/quizzes/${quiz.id}/results`}>
          <Button variant="outline" size="sm">
            <BarChart className="h-4 w-4 mr-1" />
            View Results
          </Button>
        </Link>
      );
    }
    
    if (quiz.status === 'active') {
      return (
        <Button size="sm" onClick={handleStartQuiz} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Take Quiz'}
          {!isLoading && <ArrowRight className="h-4 w-4 ml-1" />}
        </Button>
      );
    }
    
    return (
      <Button variant="outline" size="sm" disabled>
        <AlertTriangle className="h-4 w-4 mr-1" />
        Not Available
      </Button>
    );
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{quiz.title}</CardTitle>
          <Badge variant={getBadgeVariant(quiz.status)}>
            {quiz.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{quiz.description}</p>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{quiz.duration_minutes} minutes</span>
          </div>
          
          <div className="flex items-center text-sm">
            <CheckCircle className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{quiz.total_questions} Questions</span>
          </div>
          
          {quiz.created_at && (
            <div className="text-xs text-muted-foreground mt-4">
              Created: {formatDate(quiz.created_at)}
            </div>
          )}
          
          {quiz.user_response && (
            <div className="mt-4 p-2 bg-muted rounded-md">
              <div className="text-sm font-medium">Your score</div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-lg font-bold">
                  {quiz.user_response.score} / {quiz.total_score}
                </span>
                <span className="text-sm">
                  {Math.round((quiz.user_response.score / quiz.total_score) * 100)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {renderQuizAction()}
      </CardFooter>
    </Card>
  );
}