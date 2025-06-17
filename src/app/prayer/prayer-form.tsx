'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertTriangle, Sparkles, Clock } from 'lucide-react';
import { suggestPrayer, type SuggestPrayerOutput } from '@/ai/flows/prayer-suggestion';
import { useToast } from "@/hooks/use-toast";

export default function PrayerForm() {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<SuggestPrayerOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Set current time on client mount to avoid hydration mismatch for new Date()
    setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);


  const handleSuggestPrayer = async () => {
    setLoading(true);
    setError(null);
    setSuggestion(null);

    try {
      const now = new Date().toISOString();
      const result = await suggestPrayer({ currentTime: now });
      setSuggestion(result);
      toast({
        title: "Prayer Suggested",
        description: "A prayer has been suggested for the current time.",
      });
    } catch (err) {
      console.error('Error suggesting prayer:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to get prayer suggestion: ${errorMessage}`);
      toast({
        title: "Error",
        description: `Failed to get prayer suggestion: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-3" />
          <CardTitle className="font-headline text-3xl text-foreground">Prayer Suggestion Tool</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Get an AI-powered prayer suggestion appropriate for the current time of day to offer to our holy cows.
          </CardDescription>
          {currentTime && (
            <div className="flex items-center justify-center text-sm text-muted-foreground mt-2">
              <Clock className="w-4 h-4 mr-1.5" /> Current Time: {currentTime}
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <Button
            onClick={handleSuggestPrayer}
            disabled={loading}
            className="w-full text-lg py-6 shadow-md hover:shadow-lg transition-shadow"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Getting Suggestion...
              </>
            ) : (
              'Suggest a Prayer'
            )}
          </Button>

          {error && (
            <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-md flex items-start">
              <AlertTriangle className="h-5 w-5 mr-2 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {suggestion && (
            <Card className="mt-6 bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="font-headline text-2xl text-primary">Suggested Prayer:</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-lg text-foreground leading-relaxed whitespace-pre-wrap">
                  {suggestion.prayerSuggestion}
                </p>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Reasoning:</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                    {suggestion.reasoning}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
