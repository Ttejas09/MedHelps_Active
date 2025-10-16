import { ShieldCheck, Zap, HandHeart } from 'lucide-react';

// This component provides static health information
export default function AIHealthTracker({ navigate }: { navigate: (page: string) => void }) {
  const healthTopics = [
    {
      title: "Preventing Cold, Cough & Fever",
      icon: ShieldCheck,
      color: "blue",
      precautions: [
        "Wash hands frequently with soap and water.",
        "Avoid touching your eyes, nose, and mouth.",
        "Maintain a healthy diet rich in vitamins.",
        "Get adequate sleep to boost your immune system.",
      ],
      actions: [
        "Rest at home to allow your body to recover.",
        "Drink warm liquids like soup or tea.",
        "Use over-the-counter medications as needed.",
        "Consult a doctor if symptoms persist or worsen.",
      ],
    },
    {
      title: "Managing Headaches",
      icon: Zap,
      color: "purple",
      precautions: [
        "Stay hydrated by drinking enough water.",
        "Ensure you are getting regular, restful sleep.",
        "Manage stress through relaxation techniques.",
        "Avoid known triggers like certain foods or bright lights.",
      ],
      actions: [
        "Rest in a quiet, dark room.",
        "Apply a cold or warm compress to your forehead.",
        "Take over-the-counter pain relievers.",
        "Gently massage your neck and shoulders.",
      ],
    },
     {
      title: "Basic First Aid for Minor Cuts",
      icon: HandHeart,
      color: "green",
      precautions: [
        "Always be aware of your surroundings to prevent accidents.",
        "Use caution when handling sharp objects like knives or tools.",
        "Keep a first-aid kit readily accessible at home and in your car.",
      ],
      actions: [
        "Wash your hands thoroughly before treating the wound.",
        "Apply gentle pressure with a clean cloth to stop bleeding.",
        "Clean the area with cool water and mild soap.",
        "Apply an antibiotic ointment and cover with a sterile bandage.",
      ],
    },
  ];

  const colors = {
    blue: { text: 'text-blue-600', bg: 'bg-blue-100' },
    purple: { text: 'text-purple-600', bg: 'bg-purple-100' },
    green: { text: 'text-green-600', bg: 'bg-green-100' },
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800">AI Health Tracker</h1>
          <p className="mt-4 text-xl text-gray-600">Guidance for Common Ailments</p>
        </div>

        <div className="space-y-8">
            {healthTopics.map((topic, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-center mb-6">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colors[topic.color].bg}`}>
                        <topic.icon className={`w-6 h-6 ${colors[topic.color].text}`} />
                    </div>
                    <h2 className="text-2xl font-bold text-charcoal ml-4">{topic.title}</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Precautions to Take</h3>
                    <ul className="space-y-3">
                      {topic.precautions.map((item, i) => (
                        <li key={i} className="flex items-start">
                           <ShieldCheck className="w-5 h-5 text-blue-500 mr-3 mt-1 flex-shrink-0" />
                           <span className="text-gray-600">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">What to Do If It Happens</h3>
                    <ul className="space-y-3">
                      {topic.actions.map((item, i) => (
                         <li key={i} className="flex items-start">
                           <Zap className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                           <span className="text-gray-600">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
        </div>

         <div className="text-center mt-12">
            <button onClick={() => navigate('home')} className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 shadow-md">
              Back to Home
            </button>
        </div>
      </div>
    </div>
  );
}

