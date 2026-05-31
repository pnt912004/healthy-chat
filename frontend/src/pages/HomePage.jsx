// src/pages/HomePage.jsx
// Trang chủ Landing Page – chuyển đổi từ Home/code.html

import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

const HomePage = () => {
  const navigate = useNavigate();
  return (
    <>
      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-6 py-huge md:py-[96px]
                           flex flex-col md:flex-row items-center gap-xl">
        <div className="flex-1 space-y-lg">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container-high rounded-full">
            <span className="material-symbols-outlined text-primary text-sm">spa</span>
            <span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">
              Your Wellness Companion
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-display font-display text-on-background">
            Healthier Living, <br />
            <span className="text-primary">One Chat Away.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-body-lg font-body-lg text-on-surface-variant max-w-md">
            HealthyChat combines medical reliability with approachable wellness. Track calories,
            monitor hydration, and get personalized advice from our AI health assistant.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-md pt-sm">
            <Button variant="primary" onClick={() => navigate('/register')}>Get Started Free</Button>
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>Explore Features</Button>
          </div>
        </div>

        {/* Hero Image */}
        <div className="flex-1 w-full relative">
          <div className="relative w-full aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden
                           shadow-medium bg-surface-container-high border border-outline-variant">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAR08EPMI41EqTpu0CYYaBFOxDaw_60JasGeb54KM8SQ3u37AzWA3SshH0BC9UHzHR6vdqaeuFHslPUUlJD6o5mZwA8RDEzThSQEdMPN0_Ufi6vbsSDFJe_HFSd5cIdSfJ2dLJqSYZDBiFYf7g-oPJQB6Lnz0OqrmRW72l4TPRfahagC4Au_4XNgUg1XsOQ-xGMPYVjeU8GUJRKH-NeQFGL08UYQ_EABGDrnt1lpPYiD67LeWYvY307WKab5HIDqEf0Il8F8et2FGgA"
              alt="Healthy lifestyle"
              className="w-full h-full object-cover"
            />
            {/* Floating Card */}
            <div className="absolute bottom-6 left-6 right-6 md:right-auto md:w-64
                             bg-surface/90 backdrop-blur-md p-md rounded-xl shadow-medium
                             border border-outline-variant flex items-center gap-sm">
              <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary-container">favorite</span>
              </div>
              <div>
                <p className="text-label-sm font-label-sm text-on-surface-variant">Daily Goal</p>
                <p className="text-h3 font-h3 text-on-background">On Track</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="w-full max-w-7xl mx-auto px-6 py-huge bg-surface-container-lowest">
        <div className="text-center mb-xl">
          <h2 className="text-h1 font-h1 text-on-background mb-sm">Everything you need to thrive</h2>
          <p className="text-body-md font-body-md text-on-surface-variant max-w-2xl mx-auto">
            Intuitive tools designed to reduce cognitive load while managing your health seamlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          {/* AI Assistant – Wide Card */}
          <div className="md:col-span-2 bg-surface-container-low rounded-2xl p-xl
                           border border-surface-variant flex flex-col md:flex-row gap-lg
                           items-center hover:shadow-soft transition-all">
            <div className="flex-1 space-y-sm">
              <div className="w-12 h-12 bg-primary-fixed rounded-lg flex items-center justify-center mb-md">
                <span className="material-symbols-outlined text-on-primary-fixed text-2xl">smart_toy</span>
              </div>
              <h3 className="text-h2 font-h2 text-on-background">AI Health Assistant</h3>
              <p className="text-body-md font-body-md text-on-surface-variant">
                Get instant, reliable answers to your wellness queries. Our AI is trained to provide
                supportive, medically-sound guidance to help you make informed decisions daily.
              </p>
            </div>
            {/* Faux Chat UI */}
            <div className="flex-1 w-full bg-surface rounded-xl p-md border border-outline-variant
                             shadow-soft relative overflow-hidden h-48 flex flex-col justify-end">
              <div className="space-y-sm">
                <div className="bg-surface-container-high rounded-t-xl rounded-br-xl p-3 max-w-[80%]">
                  <p className="text-body-sm font-body-sm text-on-surface-variant">How much water should I drink today?</p>
                </div>
                <div className="bg-primary/10 rounded-t-xl rounded-bl-xl p-3 max-w-[90%] ml-auto">
                  <p className="text-body-sm font-body-sm text-on-background">
                    Based on your weight and activity level, aim for 2.5 liters today.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Calorie Tracking */}
          <div className="bg-surface-container-low rounded-2xl p-xl border border-surface-variant
                           flex flex-col hover:shadow-soft transition-all">
            <div className="w-12 h-12 bg-tertiary-fixed rounded-lg flex items-center justify-center mb-md">
              <span className="material-symbols-outlined text-on-tertiary-fixed text-2xl">restaurant</span>
            </div>
            <h3 className="text-h2 font-h2 text-on-background mb-sm">Calorie Tracking</h3>
            <p className="text-body-md font-body-md text-on-surface-variant mb-lg flex-grow">
              Log meals effortlessly with our streamlined interface. Keep your nutrition goals in sight.
            </p>
            <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden mt-auto">
              <div className="bg-tertiary h-full rounded-full w-[65%]"></div>
            </div>
            <div className="flex justify-between mt-2 text-label-sm font-label-sm text-on-surface-variant">
              <span>1,200 kcal</span>
              <span>1,800 Goal</span>
            </div>
          </div>

          {/* Water Reminders */}
          <div className="bg-surface-container-low rounded-2xl p-xl border border-surface-variant
                           flex flex-col hover:shadow-soft transition-all">
            <div className="w-12 h-12 bg-secondary-fixed rounded-lg flex items-center justify-center mb-md">
              <span className="material-symbols-outlined text-on-secondary-fixed text-2xl">water_drop</span>
            </div>
            <h3 className="text-h2 font-h2 text-on-background mb-sm">Water Reminders</h3>
            <p className="text-body-md font-body-md text-on-surface-variant flex-grow">
              Gentle nudges to keep you hydrated. Customize your schedule to fit your lifestyle.
            </p>
            <div className="flex gap-2 mt-lg items-center">
              {[true, true, false, false].map((filled, i) => (
                <div key={i}
                     className={`w-8 h-8 rounded-full flex items-center justify-center
                       ${filled
                         ? 'bg-secondary text-on-secondary'
                         : 'bg-surface-container-high border border-outline-variant'
                       }`}>
                  {filled && <span className="material-symbols-outlined text-sm">check</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Insights – Wide Card */}
          <div className="md:col-span-2 bg-surface-container-low rounded-2xl p-xl
                           border border-surface-variant flex flex-col md:flex-row gap-lg
                           items-center hover:shadow-soft transition-all">
            {/* Faux Bar Chart */}
            <div className="flex-1 w-full bg-surface rounded-xl p-md border border-outline-variant
                             shadow-soft h-48 flex items-end gap-2 justify-center pb-4">
              {[40, 60, 80, 50, 90].map((h, i) => (
                <div key={i}
                     className="w-8 rounded-t-md bg-primary"
                     style={{ height: `${h}%`, opacity: 0.2 + i * 0.2 }}></div>
              ))}
            </div>
            <div className="flex-1 space-y-sm">
              <div className="w-12 h-12 bg-surface-dim rounded-lg flex items-center justify-center mb-md">
                <span className="material-symbols-outlined text-on-surface text-2xl">monitoring</span>
              </div>
              <h3 className="text-h2 font-h2 text-on-background">Actionable Insights</h3>
              <p className="text-body-md font-body-md text-on-surface-variant">
                Visualize your progress over time. We distill complex data into simple, readable trends.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
