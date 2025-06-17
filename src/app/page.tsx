import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Beef, Users, Milk, Sparkles, Leaf } from 'lucide-react';

const featureSections = [
  {
    title: 'Our Sacred GIR Cows',
    description: 'Discover the revered GIR cows, their cultural significance, and gentle nature. Raised with love and respect on our organic farm.',
    href: '/cows',
    icon: Beef,
    imageSrc: 'https://placehold.co/600x400.png',
    imageAlt: 'GIR Cow',
    aiHint: 'gir cow farm'
  },
  {
    title: 'Visit Our Farm',
    description: 'Experience the tranquility of RamDairyFarm. Schedule a visit to connect with nature, learn about organic farming, and meet our holy cows.',
    href: '/visit',
    icon: Users,
    imageSrc: 'https://placehold.co/600x400.png',
    imageAlt: 'Farm Visit',
    aiHint: 'farm landscape'
  },
  {
    title: 'Pure & Organic Products',
    description: 'Taste the difference with our A2 milk and dairy products. Rich in nutrients, free from harmful additives, promoting holistic well-being.',
    href: '/products',
    icon: Milk,
    imageSrc: 'https://placehold.co/600x400.png',
    imageAlt: 'Milk Product',
    aiHint: 'milk bottle'
  },
  {
    title: 'Spiritual Connect: Prayer Guide',
    description: 'Enhance your farm visit with a moment of prayer. Our AI guide suggests timely prayers to offer to the holy cows.',
    href: '/prayer',
    icon: Sparkles,
    imageSrc: 'https://placehold.co/600x400.png',
    imageAlt: 'Prayer Offering',
    aiHint: 'prayer hands'
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh">
      <section className="relative py-20 md:py-32 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="absolute inset-0 opacity-20">
          <Image 
            src="https://placehold.co/1920x1080.png" 
            alt="RamDairyFarm Farm Background" 
            layout="fill" 
            objectFit="cover" 
            className="opacity-30"
            data-ai-hint="dairy farm cows"
          />
           <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tight text-foreground">
            RamDairyFarm <span className="text-primary">- The Holy Milk</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience the divine purity of milk from sacred GIR cows, nurtured with love on our organic farm. Discover health, tradition, and spiritual wellness with RamDairyFarm.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" asChild className="shadow-lg hover:shadow-primary/30 transition-shadow">
              <Link href="/products">
                <Milk className="mr-2 h-5 w-5" /> Explore Our Products
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="shadow-lg hover:shadow-accent/30 transition-shadow">
              <Link href="/visit">
                <Users className="mr-2 h-5 w-5" /> Schedule a Farm Visit
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-headline text-4xl md:text-5xl font-bold text-foreground">
              Embrace the <span className="text-primary">RamDairyFarm</span> Experience
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              From the sacred pastures to your home, we bring you nature's finest.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {featureSections.map((feature) => (
              <Card key={feature.title} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
                <CardHeader className="p-0">
                  <div className="aspect-video relative">
                    <Image 
                      src={feature.imageSrc} 
                      alt={feature.imageAlt} 
                      layout="fill" 
                      objectFit="cover"
                      data-ai-hint={feature.aiHint}
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-6 flex-grow">
                  <div className="flex items-center gap-3 mb-3">
                    <feature.icon className="w-8 h-8 text-primary" />
                    <CardTitle className="font-headline text-2xl text-foreground">{feature.title}</CardTitle>
                  </div>
                  <CardDescription className="text-muted-foreground text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button variant="link" asChild className="text-primary p-0 h-auto hover:text-primary/80">
                    <Link href={feature.href}>
                      Learn More <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-primary/5">
         <div className="container mx-auto px-4 text-center">
            <Leaf className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="font-headline text-4xl md:text-5xl font-bold text-foreground">
              Our Commitment to <span className="text-primary">Organic Purity</span>
            </h2>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              At RamDairyFarm, we believe in holistic, organic farming practices. Our cows graze freely on natural pastures, ensuring the milk they produce is not only pure but also imbued with the goodness of nature. No hormones, no pesticides, just pure, wholesome A2 milk.
            </p>
            <Button size="lg" asChild className="mt-10 shadow-lg hover:shadow-primary/30 transition-shadow">
              <Link href="/products#quality">
                Discover Our Quality Standards
              </Link>
            </Button>
         </div>
      </section>
    </div>
  );
}
