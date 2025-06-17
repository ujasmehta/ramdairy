import Image from 'next/image';
import PrayerForm from './prayer-form';
import { Sparkles, HelpingHand } from 'lucide-react';

export default function PrayerPage() {
  return (
    <div className="bg-background min-h-screen">
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 text-center">
          <Sparkles className="w-16 h-16 text-primary mx-auto mb-6" />
          <h1 className="font-headline text-5xl md:text-6xl font-bold text-foreground">
            Prayer Guide for Your <span className="text-primary">Farm Visit</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Offering prayers (puja) to cows is a deeply spiritual practice in Hindu tradition, recognizing their sacred status as Gau Mata (Mother Cow). Enhance your visit with a meaningful prayer.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <PrayerForm />
        </div>
      </section>

      <section className="py-16 md:py-24 bg-primary/5">
        <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <Image 
                src="https://placehold.co/800x600.png" 
                alt="Person offering prayer to a cow" 
                width={800} 
                height={600} 
                className="rounded-lg shadow-xl"
                data-ai-hint="prayer cow offering"
              />
            </div>
            <div className="lg:w-1/2">
              <HelpingHand className="w-12 h-12 text-primary mb-4" />
              <h2 className="font-headline text-4xl font-bold text-foreground mb-6">
                The Significance of Cow Worship
              </h2>
              <p className="text-lg text-muted-foreground mb-4">
                In Hinduism, the cow is revered as a symbol of life, nourishment, and selfless giving. Worshiping cows, or "Go Puja," is believed to bring prosperity, purify sins, and bestow blessings.
              </p>
              <p className="text-lg text-muted-foreground mb-4">
                Prayers can be simple expressions of gratitude, chants (mantras), or specific verses dedicated to deities associated with cows, like Lord Krishna. The act of offering prayer, along with respectfully feeding the cows, is a way to connect with the divine and express reverence for all life.
              </p>
              <p className="text-lg text-muted-foreground">
                Our AI prayer suggestion tool aims to provide a starting point, helping you find words that resonate with the moment and the sacredness of the occasion.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
