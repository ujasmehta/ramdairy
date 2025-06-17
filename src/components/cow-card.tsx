import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Leaf } from 'lucide-react';

interface CowCardProps {
  name: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  age?: string;
  origin?: string;
}

export default function CowCard({ name, description, imageUrl, imageHint, age, origin }: CowCardProps) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader className="p-0">
        <div className="aspect-video relative">
          <Image 
            src={imageUrl} 
            alt={name} 
            layout="fill" 
            objectFit="cover" 
            data-ai-hint={imageHint}
            className="transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </CardHeader>
      <CardContent className="p-6 flex-grow flex flex-col">
        <CardTitle className="font-headline text-2xl text-foreground mb-2">{name}</CardTitle>
        {age && <p className="text-sm text-muted-foreground mb-1">Age: {age}</p>}
        {origin && <p className="text-sm text-muted-foreground mb-3">Origin: {origin}</p>}
        <CardDescription className="text-base text-muted-foreground flex-grow">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
