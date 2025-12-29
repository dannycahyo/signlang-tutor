import type { Route } from './+types/home';
import { Link } from 'react-router';
import { Button } from '~/components/ui/button';
import { features, steps } from '~/constants';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Sign Language Tutor - Learn with AI' },
    {
      name: 'description',
      content:
        'Learn sign language through real-time hand gesture recognition. Train and practice ASL, SIBI, BISINDO with AI-powered feedback.',
    },
  ];
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-zinc-900 dark:text-white mb-6 tracking-tight">
            Learn Sign Language
            <span className="block text-blue-600 dark:text-blue-500 mt-2">
              with AI
            </span>
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-10">
            Interactive browser-based tutor for real-time hand gesture
            recognition. Train and practice sign language systems
            using your webcam.
          </p>
          <Link to="/tutor">
            <Button size="lg" className="text-lg px-8 py-6 h-auto">
              Start Learning
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8 text-center">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, idx) => (
              <div key={step.title} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold text-xl mb-4">
                  {idx + 1}
                </div>
                <h4 className="font-semibold text-zinc-900 dark:text-white mb-2">
                  {step.title}
                </h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
