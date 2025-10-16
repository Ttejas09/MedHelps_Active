import { Download, FolderHeart, Heart } from 'lucide-react';

const steps = [
  {
    icon: Download,
    title: 'Download & Register',
    description: 'Get the app and create your secure profile in minutes.',
  },
  {
    icon: FolderHeart,
    title: 'Consolidate Your Health',
    description: 'Add your records, prescriptions, and doctor details.',
  },
  {
    icon: Heart,
    title: 'Live Healthier',
    description: 'Access all features to manage your health with confidence.',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="text-xl text-gray-600">Get started in three simple steps</p>
        </div>

        <div className="relative">
          <div className="absolute left-8 top-12 bottom-12 w-0.5 bg-gradient-to-b from-primary via-accent to-primary hidden md:block"></div>

          <div className="space-y-12">
            {steps.map((step, index) => (
              <div key={index} className="relative flex items-start gap-6 md:gap-8">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center shadow-lg">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                </div>

                <div className="flex-1 bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl font-bold text-gradient">0{index + 1}</span>
                    <h3 className="text-2xl font-bold text-charcoal">{step.title}</h3>
                  </div>
                  <p className="text-gray-600 text-lg leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
