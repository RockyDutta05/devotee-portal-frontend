import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { Briefcase, Users, ShieldCheck, Lock, HeartHandshake } from 'lucide-react';
import WatermarkBackground from '../components/WatermarkBackground';

export default function Home() {
  return (
    <div className="relative flex flex-col gap-16 md:gap-24 py-8 pb-16">
      <WatermarkBackground />

      {/* All sections sit above the background + overlay */}
      <div className="relative z-30 flex flex-col gap-16 md:gap-24">

        {/* 1. Hero Section */}
        <section className="text-center px-4 pt-10 md:pt-20">
          <div className="inline-block bg-orange-100 text-orange-800 text-sm font-semibold px-4 py-1.5 rounded-full mb-6 border border-orange-200 shadow-sm">
            🌸 Exclusively for ISKCON Devotees
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-950 tracking-tight mb-6 max-w-4xl mx-auto leading-tight drop-shadow-sm">
            Connect. Refer.{' '}
            <span className="text-orange-600">Grow Together.</span>
          </h1>
          <p className="max-w-2xl text-lg md:text-xl text-gray-800 font-medium mb-10 mx-auto leading-relaxed">
            A dedicated career and referral portal exclusively for ISKCON devotees working in the private sector worldwide.
            Built on the trust of our shared spiritual community.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signup" className="w-full sm:w-auto">
              <Button className="w-full text-lg px-8 py-3 shadow-lg">Join the Community</Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full text-lg px-8 py-3 bg-white/80 border-gray-900 text-gray-900 hover:bg-white shadow-md">
                Login
              </Button>
            </Link>
          </div>
        </section>

        {/* 2. Explanation of the Portal */}
        <section className="px-4">
          <div className="bg-white/85 backdrop-blur-md border border-orange-200 rounded-3xl p-8 md:p-12 text-center max-w-5xl mx-auto shadow-lg">
            <HeartHandshake className="h-14 w-14 text-orange-600 mx-auto mb-6" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-950 mb-4">Why This Portal Exists</h2>
            <p className="text-gray-800 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed font-medium">
              This platform bridges the gap between devotees seeking career growth and those established in the corporate world.
              Instead of a generic job board, we rely on the strength and trust of our spiritual community to help each other
              succeed professionally through direct referrals and meaningful connections.
            </p>
          </div>
        </section>

        {/* Grid for Features */}
        <section className="px-4 max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-8">
          {/* 3. Career Opportunities */}
          <div className="bg-white/85 backdrop-blur-md rounded-2xl p-8 shadow-md border border-blue-100 flex flex-col gap-4">
            <div className="h-14 w-14 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center border border-blue-200 shadow-sm">
              <Briefcase className="h-7 w-7" />
            </div>
            <h3 className="text-2xl font-bold text-gray-950">Career Opportunities</h3>
            <p className="text-gray-800 leading-relaxed text-base font-medium">
              Browse job postings shared directly by other devotees. Employers and employees can post open positions,
              indicate hiring status, and find candidates whose values align with the community. Upload targeted
              resumes to let recruiters know you are actively looking.
            </p>
          </div>

          {/* 4. Referral Network */}
          <div className="bg-white/85 backdrop-blur-md rounded-2xl p-8 shadow-md border border-green-100 flex flex-col gap-4">
            <div className="h-14 w-14 bg-green-100 text-green-700 rounded-xl flex items-center justify-center border border-green-200 shadow-sm">
              <Users className="h-7 w-7" />
            </div>
            <h3 className="text-2xl font-bold text-gray-950">Referral Network</h3>
            <p className="text-gray-800 leading-relaxed text-base font-medium">
              Looking to join a specific company? Find devotees who have indicated their willingness to refer others to their
              workplaces. Send a referral request with your target job ID and connect directly. Referral requests are
              capped to encourage thoughtful and targeted outreach.
            </p>
          </div>

          {/* 5. Community Trust */}
          <div className="bg-white/85 backdrop-blur-md rounded-2xl p-8 shadow-md border border-purple-100 flex flex-col gap-4">
            <div className="h-14 w-14 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center border border-purple-200 shadow-sm">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h3 className="text-2xl font-bold text-gray-950">Community Trust</h3>
            <p className="text-gray-800 leading-relaxed text-base font-medium">
              Every member is manually verified by administrators during registration to ensure a secure, authentic
              devotee-only network. Your connections are meaningful, built on a shared spiritual foundation rather
              than just generic professional networking.
            </p>
          </div>

          {/* 6. Privacy & Consent */}
          <div className="bg-white/85 backdrop-blur-md rounded-2xl p-8 shadow-md border border-gray-200 flex flex-col gap-4">
            <div className="h-14 w-14 bg-gray-100 text-gray-800 rounded-xl flex items-center justify-center border border-gray-300 shadow-sm">
              <Lock className="h-7 w-7" />
            </div>
            <h3 className="text-2xl font-bold text-gray-950">Privacy &amp; Consent First</h3>
            <p className="text-gray-800 leading-relaxed text-base font-medium">
              Your privacy is paramount. Phone numbers and email addresses are hidden by default. If someone wants to
              reach out, they must send a "Contact Info Request" with a mandatory reason. Your contact details are only
              revealed if you explicitly approve the request.
            </p>
          </div>
        </section>

        {/* 7. Bottom CTA */}
        <section className="text-center px-4 pb-8">
          <div className="bg-gray-950 rounded-3xl p-10 md:p-16 max-w-5xl mx-auto shadow-2xl relative overflow-hidden border border-orange-900/30">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
                Ready to take the next step in your career?
              </h2>
              <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of ISKCON devotees worldwide sharing opportunities and helping each other grow.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/signup" className="w-full sm:w-auto">
                  <Button className="w-full text-lg px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white shadow-lg border-0">
                    Join the Community
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
