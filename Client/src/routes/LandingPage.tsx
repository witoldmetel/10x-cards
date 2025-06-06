import { Logo } from '@/components/core/Logo/Logo';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';

import { Link } from 'react-router';

export default function LandingPage() {
  const { isAuth } = useAuth();

  return (
    <div className='min-h-screen flex flex-col'>
      <header className='border-b bg-card'>
        <div className='container mx-auto flex justify-between items-center py-4'>
          <Logo />
          <div className='flex items-center gap-4'>
            {isAuth ? (
              <Link to='/dashboard'>
                <Button>Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to='/login'>
                  <Button variant='ghost' data-testid='signin-button'>
                    Sign in
                  </Button>
                </Link>
                <Link to='/register'>
                  <Button data-testid='signup-button'>Sign up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className='flex-1'>
        {/* Hero Section */}
        <section className='py-20 bg-gradient-to-b from-background to-muted'>
          <div className='container mx-auto px-4 text-center'>
            <h1 className='text-4xl md:text-6xl font-bold mb-6'>
              Learn <span className='text-primary'>10x</span> Faster with{' '}
              <span className='text-primary'>AI-Powered Flashcards</span>
            </h1>
            <p className='text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto'>
              Generate high-quality flashcards from any text and learn efficiently with our advanced spaced repetition
              system.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Link to={isAuth ? '/dashboard' : '/register'}>
                <Button size='lg' className='text-lg px-8'>
                  Get Started
                </Button>
              </Link>
              <a href='#features'>
                <Button variant='outline' size='lg' className='text-lg px-8'>
                  Learn More
                </Button>
              </a>
            </div>
            <div className='mt-16 relative'>
              <div className='bg-card shadow-lg rounded-lg border p-6 max-w-5xl mx-auto'>
                <div className='flex flex-col sm:flex-row gap-6 items-center'>
                  <div className='flex-1 flex flex-col gap-4'>
                    <div className='bg-muted rounded-lg p-4'>
                      <h3 className='font-semibold'>Source Text</h3>
                      <p className='text-sm text-muted-foreground mt-2'>
                        The krebs cycle is a series of chemical reactions used by all aerobic organisms to release
                        stored energy...
                      </p>
                    </div>
                  </div>
                  <div className='hidden sm:flex items-center'>
                    <div className='animate-bounce-subtle'>
                      <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                        <path
                          d='M5 12H19M19 12L12 5M19 12L12 19'
                          stroke='currentColor'
                          strokeWidth='2'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        />
                      </svg>
                    </div>
                  </div>
                  <div className='flex-1 flex flex-col gap-4'>
                    <div className='bg-primary/10 rounded-lg p-4'>
                      <h3 className='font-semibold text-primary'>Generated Flashcards</h3>
                      <div className='space-y-2 mt-2'>
                        <div className='bg-card rounded border p-3'>
                          <p className='font-medium'>What is the Krebs cycle?</p>
                          <p className='text-sm text-muted-foreground mt-1'>
                            A series of chemical reactions used by all aerobic organisms to release stored energy
                          </p>
                        </div>
                        <div className='bg-card rounded border p-3'>
                          <p className='font-medium'>Which organisms use the Krebs cycle?</p>
                          <p className='text-sm text-muted-foreground mt-1'>All aerobic organisms</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id='features' className='py-16 bg-card'>
          <div className='container mx-auto px-4'>
            <h2 className='text-3xl font-bold text-center mb-12'>Key Features</h2>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
              <div className='bg-background rounded-lg p-6 shadow-sm border'>
                <div className='h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4'>
                  <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <path
                      d='M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z'
                      stroke='currentColor'
                      strokeWidth='2'
                    />
                    <path d='M12 7V12L15 15' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
                  </svg>
                </div>
                <h3 className='text-xl font-semibold mb-2'>SM-2 Spaced Repetition</h3>
                <p className='text-muted-foreground'>
                  Optimize your learning with scientifically proven spaced repetition algorithms that schedule reviews
                  at the perfect time.
                </p>
              </div>
              <div className='bg-background rounded-lg p-6 shadow-sm border'>
                <div className='h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4'>
                  <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <path
                      d='M12 6V12L16 14'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='2' />
                  </svg>
                </div>
                <h3 className='text-xl font-semibold mb-2'>AI Flashcard Generation</h3>
                <p className='text-muted-foreground'>
                  Instantly create high-quality flashcards from any text with our advanced AI that identifies key
                  concepts and questions.
                </p>
              </div>
              <div className='bg-background rounded-lg p-6 shadow-sm border'>
                <div className='h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4'>
                  <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <path d='M12 4V20M4 12H20' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
                  </svg>
                </div>
                <h3 className='text-xl font-semibold mb-2'>Custom Collections</h3>
                <p className='text-muted-foreground'>
                  Organize your flashcards into custom collections with tags and categories for better organization and
                  focused study sessions.
                </p>
              </div>
              <div className='bg-background rounded-lg p-6 shadow-sm border'>
                <div className='h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4'>
                  <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <path
                      d='M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z'
                      stroke='currentColor'
                      strokeWidth='2'
                    />
                    <path
                      d='M18 20C18 16.6863 15.3137 14 12 14C8.68629 14 6 16.6863 6 20'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                    />
                  </svg>
                </div>
                <h3 className='text-xl font-semibold mb-2'>Personalized Learning</h3>
                <p className='text-muted-foreground'>
                  Adapt to your learning style with personalized algorithms that adjust to your strengths, weaknesses,
                  and study patterns.
                </p>
              </div>
              <div className='bg-background rounded-lg p-6 shadow-sm border'>
                <div className='h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4'>
                  <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <path
                      d='M9 18L15 12L9 6'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </div>
                <h3 className='text-xl font-semibold mb-2'>Progress Tracking</h3>
                <p className='text-muted-foreground'>
                  Monitor your learning journey with detailed analytics, visualize your memory retention, and identify
                  areas for improvement.
                </p>
              </div>
              <div className='bg-background rounded-lg p-6 shadow-sm border'>
                <div className='h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4'>
                  <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <path
                      d='M20 16L12 8L4 16'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </div>
                <h3 className='text-xl font-semibold mb-2'>Cloud Sync</h3>
                <p className='text-muted-foreground'>
                  Access your flashcards across all devices with seamless cloud synchronization, never losing your
                  progress or collections.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className='py-20 bg-primary text-primary-foreground'>
          <div className='container mx-auto px-4 text-center'>
            <h2 className='text-3xl font-bold mb-6'>Ready to Learn 10x Faster?</h2>
            <p className='text-xl mb-8 max-w-2xl mx-auto opacity-90'>
              Join thousands of students and professionals who are accelerating their learning with our AI-powered
              flashcard system.
            </p>
            <Link to={isAuth ? '/dashboard' : '/register'}>
              <Button variant='secondary' size='lg' className='text-lg px-8'>
                Start Free
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className='bg-muted py-8'>
        <div className='container mx-auto px-4'>
          <div className='flex flex-col md:flex-row justify-between items-center'>
            <div className='mb-4 md:mb-0'>
              <p className='text-sm text-muted-foreground'>© 2025 10x Cards. All rights reserved.</p>
            </div>
            <div className='flex gap-6'>
              <Dialog>
                <DialogTrigger asChild>
                  <button className='text-sm text-muted-foreground hover:text-foreground'>Privacy Policy</button>
                </DialogTrigger>
                <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
                  <DialogHeader>
                    <DialogTitle>Privacy Policy</DialogTitle>
                    <DialogDescription>Last updated: March 2024</DialogDescription>
                  </DialogHeader>
                  <div className='space-y-4 py-4'>
                    <h3 className='text-lg font-semibold'>1. Information We Collect</h3>
                    <p className='text-muted-foreground'>
                      We collect information that you provide directly to us, including your name, email address, and
                      usage data to improve your learning experience.
                    </p>

                    <h3 className='text-lg font-semibold'>2. How We Use Your Information</h3>
                    <p className='text-muted-foreground'>
                      We use the information we collect to provide and improve our services, personalize your
                      experience, and send you updates about your learning progress.
                    </p>

                    <h3 className='text-lg font-semibold'>3. Data Security</h3>
                    <p className='text-muted-foreground'>
                      We implement appropriate security measures to protect your personal information from unauthorized
                      access, alteration, or destruction.
                    </p>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <button className='text-sm text-muted-foreground hover:text-foreground'>Terms of Service</button>
                </DialogTrigger>
                <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
                  <DialogHeader>
                    <DialogTitle>Terms of Service</DialogTitle>
                    <DialogDescription>Last updated: March 2024</DialogDescription>
                  </DialogHeader>
                  <div className='space-y-4 py-4'>
                    <h3 className='text-lg font-semibold'>1. Acceptance of Terms</h3>
                    <p className='text-muted-foreground'>
                      By accessing or using 10x Cards, you agree to be bound by these Terms of Service and all
                      applicable laws and regulations.
                    </p>

                    <h3 className='text-lg font-semibold'>2. User Accounts</h3>
                    <p className='text-muted-foreground'>
                      You are responsible for maintaining the confidentiality of your account and password. You agree to
                      accept responsibility for all activities that occur under your account.
                    </p>

                    <h3 className='text-lg font-semibold'>3. Intellectual Property</h3>
                    <p className='text-muted-foreground'>
                      The service and its original content, features, and functionality are owned by 10x Cards and are
                      protected by international copyright, trademark, and other intellectual property laws.
                    </p>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <button className='text-sm text-muted-foreground hover:text-foreground'>Contact</button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Contact Us</DialogTitle>
                    <DialogDescription>
                      Send us a message and we'll get back to you as soon as possible.
                    </DialogDescription>
                  </DialogHeader>
                  <div className='space-y-4 py-4'>
                    <div className='space-y-2'>
                      <label className='text-sm font-medium'>Name</label>
                      <Input placeholder='Enter your name' />
                    </div>
                    <div className='space-y-2'>
                      <label className='text-sm font-medium'>Email</label>
                      <Input type='email' placeholder='Enter your email' />
                    </div>
                    <div className='space-y-2'>
                      <label className='text-sm font-medium'>Message</label>
                      <Textarea placeholder='Type your message here' className='min-h-[100px]' />
                    </div>
                    <Button className='w-full'>Send Message</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
