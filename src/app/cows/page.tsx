import Image from 'next/image';
import CowCard from '@/components/cow-card';
import { Beef, HeartHandshake } from 'lucide-react';

const cowsData = [
  {
    name: 'Lakshmi',
    description: 'A gentle and nurturing matriarch, Lakshmi is known for her calm demeanor and high-quality milk. She embodies the sacredness of GIR cows.',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'gir cow portrait',
    age: '7 years',
    origin: 'Gujarat, India'
  },
  {
    name: 'Ganga',
    description: 'Named after the holy river, Ganga is a spirited cow with a playful personality. Her milk is exceptionally rich and creamy.',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'gir cow grazing',
    age: '5 years',
    origin: 'Gujarat, India'
  },
  {
    name: 'Saraswati',
    description: 'Wise and serene, Saraswati is a picture of health and vitality. She enjoys basking in the sun and is a favorite among visitors.',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'gir cow close up',
    age: '6 years',
    origin: 'Gujarat, India'
  },
  {
    name: 'Parvati',
    description: 'Graceful and majestic, Parvati is a prime example of the GIR breed\'s beauty. She is known for her strong maternal instincts.',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'majestic gir cow',
    age: '8 years',
    origin: 'Gujarat, India'
  },
];

export default function CowsPage() {
  return (
    <div className="bg-background min-h-screen">
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 text-center">
          <Beef className="w-16 h-16 text-primary mx-auto mb-6" />
          <h1 className="font-headline text-5xl md:text-6xl font-bold text-foreground">
            Our Sacred <span className="text-primary">GIR Cows</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            GIR cows are revered in Hindu culture as sacred beings, embodying purity, divinity, and motherhood. At RamDairyFarm, we honor this ancient tradition by nurturing our cows with utmost care, respect, and love in a natural, organic environment.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {cowsData.map((cow) => (
              <CowCard key={cow.name} {...cow} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <Image 
                src="https://placehold.co/800x600.png" 
                alt="GIR Cows in pasture" 
                width={800} 
                height={600} 
                className="rounded-lg shadow-xl"
                data-ai-hint="cows pasture"
              />
            </div>
            <div className="lg:w-1/2">
              <HeartHandshake className="w-12 h-12 text-primary mb-4" />
              <h2 className="font-headline text-4xl font-bold text-foreground mb-6">
                The GIR Breed: A Legacy of Purity
              </h2>
              <p className="text-lg text-muted-foreground mb-4">
                Originating from the Gir forests of Gujarat, India, the GIR breed is one of the principal Zebu breeds. They are known for their distinctive appearance, including a prominent forehead and long, pendulous ears.
              </p>
              <p className="text-lg text-muted-foreground mb-4">
                More importantly, GIR cows are celebrated for producing A2 milk, which is believed to be healthier and easier to digest than A1 milk. Their gentle temperament and resilience make them ideal for traditional, low-stress farming practices.
              </p>
              <p className="text-lg text-muted-foreground">
                At RamDairyFarm, our cows are more than livestock; they are family. We ensure they live happy, healthy lives, which we believe translates directly into the quality and purity of their milk.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
