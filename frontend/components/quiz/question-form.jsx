'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Loader2, Plus, Trash } from 'lucide-react';
import useQuestionStore from '@/store/question-store';

// Form validation schema
const optionSchema = z.object({
  option_text: z.string().min(1, 'Option text is required'),
  is_correct: z.boolean().default(false),
});

const formSchema = z.object({
  question_text: z.string().min(3, 'Question text must be at least 3 characters'),
  question_type: z.enum(['single_choice', 'multiple_choice', 'text']),
  score: z.coerce.number().min(1, 'Score must be at least 1 point'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  explanation: z.string().optional(),
  options: z.array(optionSchema)
    .min(2, 'At least 2 options are required for choice questions')
    .refine(
      (options) => options.some(option => option.is_correct),
      { message: 'At least one option must be marked correct' }
    ),
});

export default function QuestionForm({ questionId }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { createQuestion, updateQuestion, setCurrentQuestion } = useQuestionStore();
  
  // Initialize form with default values
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question_text: '',
      question_type: 'single_choice',
      score: 1,
      difficulty: 'medium',
      explanation: '',
      options: [
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
      ],
    },
  });
  
  // Setup field array for options
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'options',
  });
  
  // Get current question type
  const questionType = form.watch('question_type');
  
  // Fetch question data for editing if questionId is provided
  useEffect(() => {
    const loadQuestion = async () => {
      if (questionId) {
        setLoading(true);
        try {
          // In a real application, you would fetch from API
          // Here we're assuming data is already in the store
          const questionData = await fetch(`/api/questions/${questionId}`).then(res => res.json());
          
          form.reset({
            question_text: questionData.question_text,
            question_type: questionData.question_type,
            score: questionData.score,
            difficulty: questionData.difficulty,
            explanation: questionData.explanation || '',
            options: questionData.options.length > 0 
              ? questionData.options 
              : [{ option_text: '', is_correct: false }, { option_text: '', is_correct: false }],
          });
        } catch (error) {
          console.error('Failed to fetch question:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadQuestion();
  }, [questionId, form]);
  
  // Handle adding a new option
  const handleAddOption = () => {
    append({ option_text: '', is_correct: false });
  };
  
  // Handle form submission
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // If question type is text, no options needed
      if (data.question_type === 'text') {
        data.options = [];
      }
      
      if (questionId) {
        // Update existing question
        await updateQuestion(questionId, data);
      } else {
        // Create new question
        await createQuestion(data);
      }
      
      router.push('/admin/questions');
    } catch (error) {
      console.error('Failed to save question:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{questionId ? 'Edit Question' : 'Create New Question'}</CardTitle>
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
                name="question_text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Text</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter your question"
                        className="min-h-20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="question_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="single_choice">Single Choice</SelectItem>
                          <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                          <SelectItem value="text">Text Answer</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="score"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Score Points</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" step="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="explanation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>quiz</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide an explanation for the correct answer"
                        className="min-h-20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="question_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="single_choice">Single Choice</SelectItem>
                          <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                          <SelectItem value="text">Text Answer</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="score"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Score Points</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" step="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="explanation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Explanation (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide an explanation for the correct answer"
                        className="min-h-20"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This will be shown to users after they submit their answers
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Options section - only show for choice questions */}
              {(questionType === 'single_choice' || questionType === 'multiple_choice') && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Answer Options</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddOption}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Option
                    </Button>
                  </div>
                  
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-3 p-3 border rounded-md">
                      <FormField
                        control={form.control}
                        name={`options.${index}.is_correct`}
                        render={({ field }) => (
                          <FormItem className="flex items-start mt-2 space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={(checked) => {
                                  // For single choice, uncheck all other options
                                  if (questionType === 'single_choice' && checked) {
                                    const options = form.getValues('options');
                                    options.forEach((_, i) => {
                                      if (i !== index) {
                                        form.setValue(`options.${i}.is_correct`, false);
                                      }
                                    });
                                  }
                                  field.onChange(checked);
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal cursor-pointer">
                              Correct
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex-grow">
                        <FormField
                          control={form.control}
                          name={`options.${index}.option_text`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="Enter option text" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      {fields.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                        >
                          <Trash className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  {form.formState.errors.options && !form.formState.errors.options.type && (
                    <p className="text-sm font-medium text-destructive">
                      {form.formState.errors.options.message}
                    </p>
                  )}
                </div>
              )}
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
          {questionId ? 'Update Question' : 'Create Question'}
        </Button>
      </CardFooter>
    </Card>
  );
}
                  