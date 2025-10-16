import { Target, Lightbulb, Shield, Users } from 'lucide-react';

const values = [
  {
    icon: Users,
    title: 'Patient-First',
    description: 'Every decision we make prioritizes the needs and wellbeing of our users.',
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    description: 'We continuously explore new technologies to improve healthcare accessibility.',
  },
  {
    icon: Shield,
    title: 'Trust & Security',
    description: 'Your health data is protected with the highest standards of security and privacy.',
  },
  {
    icon: Target,
    title: 'Excellence',
    description: 'We strive for excellence in every feature and interaction within our platform.',
  },
];

const team = [
  { name: 'Harshit', role: 'Leader', initial: 'H' },
  { name: 'Yash raj', role: 'Data expert', initial: 'Y' },
  { name: 'Tejas', role: 'Tech expert', initial: 'T' },
  { name: 'Vedika', role: 'Developer', initial: 'V' },
];

export default function About() {
  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            About <span className="text-gradient">MedHelps</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Building the future of healthcare technology, one innovation at a time
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          <div className="space-y-8">
            <div>
              <h3 className="text-3xl font-bold mb-4 text-charcoal flex items-center gap-3">
                <Target className="w-8 h-8 text-primary" />
                Our Mission
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                To empower every individual with technology that makes quality healthcare simple, accessible, and proactive. We believe everyone deserves seamless access to their health information and medical services.
              </p>
            </div>

            <div>
              <h3 className="text-3xl font-bold mb-4 text-charcoal flex items-center gap-3">
                <Lightbulb className="w-8 h-8 text-accent" />
                Our Journey
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Born from a student project at IIIT Nagpur on October 1st, 2025, MedHelps is driven by a passion to solve real-world health challenges. We are a team of innovators dedicated to building a healthier future for India.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <h3 className="text-3xl font-bold mb-8 text-charcoal">Our Core Values</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="space-y-3 p-4 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
                    <value.icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-bold text-lg text-charcoal">{value.title}</h4>
                  <p className="text-gray-600 text-sm">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-3xl font-bold mb-12 text-center text-charcoal">
            Meet Our <span className="text-gradient">Team</span>
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="w-24 h-24 gradient-primary rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                  {member.initial}
                </div>
                <h4 className="font-bold text-xl text-charcoal mb-1">{member.name}</h4>
                <p className="text-gray-600">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
