'use server';

/**
 * @fileOverview An AI agent that suggests a prayer based on the current time of day.
 *
 * - suggestPrayer - A function that suggests a prayer based on the current time of day.
 * - SuggestPrayerInput - The input type for the suggestPrayer function.
 * - SuggestPrayerOutput - The return type for the suggestPrayer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestPrayerInputSchema = z.object({
  currentTime: z
    .string()
    .describe('The current time of day in ISO 8601 format (e.g. 2024-07-22T10:00:00Z).'),
});
export type SuggestPrayerInput = z.infer<typeof SuggestPrayerInputSchema>;

const SuggestPrayerOutputSchema = z.object({
  prayerSuggestion: z
    .string()
    .describe('A suggested prayer appropriate for the current time of day.'),
  reasoning: z
    .string()
    .describe('The reasoning behind the prayer suggestion, including why it is appropriate for the given time.'),
});
export type SuggestPrayerOutput = z.infer<typeof SuggestPrayerOutputSchema>;

export async function suggestPrayer(input: SuggestPrayerInput): Promise<SuggestPrayerOutput> {
  return suggestPrayerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestPrayerPrompt',
  input: {schema: SuggestPrayerInputSchema},
  output: {schema: SuggestPrayerOutputSchema},
  prompt: `You are a knowledgeable guide on Hindu prayers, particularly those appropriate for offering to cows at a dairy farm.

  Based on the current time, suggest a prayer that would be meaningful and appropriate for a visitor to offer to the holy cows at RamDairyFarm farm.

  Current Time: {{{currentTime}}}

  Consider the time of day and suggest a prayer that aligns with the activities and significance of that time in relation to cow worship.
  Explain your reasoning for suggesting this particular prayer. Be concise and respectful.
  `,
});

const suggestPrayerFlow = ai.defineFlow(
  {
    name: 'suggestPrayerFlow',
    inputSchema: SuggestPrayerInputSchema,
    outputSchema: SuggestPrayerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

