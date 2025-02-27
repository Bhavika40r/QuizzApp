'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import useQuizStore from '@/store/quiz-store';

// Form validation schema
const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  duration_minutes: z.coerce.number().min(1, 'Duration must be at least 1 minute'),
  passing_score: z.coerce.number().min(0, 'Passing score must be a positive number'),
  status: z.enum(['draft', 'active']),
});

export default function QuizForm({ quizId }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { createQuiz, updateQuiz, fetchQuizById } = useQuizStore();
  
  // Initialize form with default values or existing quiz data
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      duration_minutes: 30,
      passing_score: 70,
      status: 'draft',
    },
  });
  
  // Fetch quiz data for editing if quizId is provided
  useEffect(() => {
    const loadQuiz = async () => {
      if (quizId) {
        setLoading(true);
        try {
          const quizData = await fetchQuizById(quizId);
          
          // Reset form with fetched data
          form.reset({
            title: quizData.title,
            description: quizData.description,
            duration_minutes: quizData.duration_minutes,
            passing_score: quizData.passing_score,
            status: quizData.status,
          });
        } catch (error) {
          console.error('Failed to fetch quiz:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadQuiz();
  }, [quizId, fetchQuizById, form]);
  
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (quizId) {
        // Update existing quiz
        await updateQuiz(quizId, data);
        router.push(`/admin/quizzes/${quizId}`);
      } else {
        // Create new quiz
        const newQuiz = await createQuiz(data);
        router.push(`/admin/quizzes/${newQuiz.id}`);
      }
    } catch (error) {
      console.error('Failed to save quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{quizId ? 'Edit Quiz' : 'Create New Quiz'}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && !form.formState.isSubmitting ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quiz Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter quiz title" {...field} />
                    </FormControl>
                    <FormDescription>
                      A descriptive title for your quiz
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide a brief description of the quiz"
                        className="min-h-20"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Explain what the quiz is about and what participants will learn
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="duration_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" step="1" {...field} />
                      </FormControl>
                      <FormDescription>
                        Time limit for completing the quiz
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="passing_score"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Passing Score (%)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" max="100" step="1" {...field} />
                      </FormControl>
                      <FormDescription>
                        Minimum percentage to pass the quiz
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Set to "Active" to make the quiz available to users
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="h-4" />
            </form>
          </Form>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={loading || form.formState.isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          onClick={form.handleSubmit(onSubmit)}
          disabled={loading || form.formState.isSubmitting}
        >
          {form.formState.isSubmitting && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {quizId ? 'Update Quiz' : 'Create Quiz'}
        </Button>
      </CardFooter>
    </Card>
  );
}