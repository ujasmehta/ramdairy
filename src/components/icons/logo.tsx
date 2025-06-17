import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/" className="text-3xl font-bold font-headline text-primary hover:text-primary/90 transition-colors">
      RamDairyFarm
    </Link>
  );
}
