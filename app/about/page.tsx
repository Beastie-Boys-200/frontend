import { NavbarWithModal } from '@/components/layout/NavbarWithModal';
import { TrianglesBackground } from '@/components/animations/TrianglesBackground';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { GlowCard } from '@/components/ui';
import TechStack3D from '@/components/sections/TechStack3D';

export default function AboutPage() {
  const values = [
    {
      title: 'Innovation',
      description: 'We constantly push boundaries to create groundbreaking solutions that shape the future.',
    },
    {
      title: 'Excellence',
      description: 'We strive for perfection in every line of code and every product we deliver.',
    },
    {
      title: 'Collaboration',
      description: 'We believe in the power of teamwork and diverse perspectives to achieve greatness.',
    },
  ];

  const projects = [
    {
      title: 'Project Alpha',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      color: 'pink',
    },
    {
      title: 'Project Beta',
      description: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      color: 'purple',
    },
    {
      title: 'Project Gamma',
      description: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
      color: 'pink',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Triangles Animation Background */}
      <TrianglesBackground />

      {/* Navbar */}
      <NavbarWithModal />

      {/* Content */}
      <div className="relative z-10 pt-24 pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-24">
            <ScrollReveal animation="fade-up" duration={600}>
              <h1 className="text-5xl md:text-7xl font-black text-white mb-6">
                About{' '}
                <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 bg-clip-text text-transparent">
                  Us
                </span>
              </h1>
            </ScrollReveal>
            <ScrollReveal animation="fade-up" delay={100} duration={600}>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
                We are a team of passionate developers and innovators dedicated to creating
                cutting-edge solutions for the future of telecommunications.
              </p>
            </ScrollReveal>
          </div>

          {/* Our Mission */}
          <ScrollReveal animation="fade-up" duration={600}>
            <div className="mb-24">
              <GlowCard>
                <div className="p-8 md:p-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Our Mission</h2>
                  <p className="text-lg text-gray-300 leading-relaxed mb-4">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
                    tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                    quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </p>
                  <p className="text-lg text-gray-300 leading-relaxed">
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore
                    eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident,
                    sunt in culpa qui officia deserunt mollit anim id est laborum.
                  </p>
                </div>
              </GlowCard>
            </div>
          </ScrollReveal>

          {/* Tech Stack Section - Hidden on mobile */}
          <ScrollReveal animation="fade-up" duration={600}>
            <div className="mb-[15px] hidden lg:block">
              <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
                Our{' '}
                <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 bg-clip-text text-transparent">
                  Technology Stack
                </span>
              </h2>
              <div className="rounded-2xl overflow-hidden">
                <TechStack3D />
              </div>
            </div>
          </ScrollReveal>

          {/* What We've Built */}
          <ScrollReveal animation="fade-up" duration={600}>
            <div className="mb-24">
              <GlowCard>
                <div className="p-8 md:p-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                    What We've Built
                  </h2>
                  <div className="space-y-6">
                    {projects.map((project, index) => (
                      <div
                        key={index}
                        className={`border-l-4 ${
                          project.color === 'pink' ? 'border-pink-500' : 'border-purple-500'
                        } pl-6`}
                      >
                        <h3 className="text-xl font-semibold text-white mb-2">{project.title}</h3>
                        <p className="text-gray-300">{project.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </GlowCard>
            </div>
          </ScrollReveal>

          {/* Our Values */}
          <div className="grid md:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <ScrollReveal
                key={index}
                animation="fade-up"
                duration={600}
                delay={index * 100}
              >
                <GlowCard glowIntensity="low">
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                    <p className="text-gray-300">{value.description}</p>
                  </div>
                </GlowCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}