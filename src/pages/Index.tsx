
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import Navbar from '@/components/Navbar';
import Logo from '@/components/Logo';
import Wave from '@/components/Wave';
import { ArrowRight, File, Search, Upload } from 'lucide-react';

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-background to-water-light py-20 md:py-32 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Logo size="large" className="mx-auto mb-8" />
            <h1 className="mb-6">
              Welcome to DeepWaters—<br className="hidden sm:block" />
              <span className="text-water-deep">a serene space</span> for planning, reflection, and growth
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-neutral-dark">
              Transform your lengthy plans, doctrines, and reflections into beautifully structured, easy-to-navigate documents.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg" asChild>
                <Link to="/start">
                  Start Planning <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg" asChild>
                <Link to="/documents">
                  View Examples
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Animated background elements */}
        <div className="hidden md:block absolute bottom-0 left-0 w-24 h-24 bg-water/20 rounded-full animate-float" style={{ animationDelay: '0s' }}></div>
        <div className="hidden md:block absolute top-40 right-32 w-16 h-16 bg-water/30 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="hidden md:block absolute bottom-40 right-20 w-32 h-32 bg-water/10 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
      </section>
      
      {/* Feature Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="section-heading text-center mb-16">Experience Clarity in Your Planning</h2>
          
          <div className="grid md:grid-cols-3 gap-10">
            <div className="water-card p-8 flex flex-col items-center text-center">
              <div className="p-4 bg-water-light/50 rounded-full mb-6">
                <File className="h-10 w-10 text-water-deep" />
              </div>
              <h3 className="text-xl font-medium mb-3">Beautiful Documents</h3>
              <p className="text-neutral-dark">
                Transform your plain text into beautifully formatted documents with automatic structure detection.
              </p>
            </div>
            
            <div className="water-card p-8 flex flex-col items-center text-center">
              <div className="p-4 bg-water-light/50 rounded-full mb-6">
                <Search className="h-10 w-10 text-water-deep" />
              </div>
              <h3 className="text-xl font-medium mb-3">Easy Navigation</h3>
              <p className="text-neutral-dark">
                Automatically generate table of contents and enjoy smooth scrolling between document sections.
              </p>
            </div>
            
            <div className="water-card p-8 flex flex-col items-center text-center">
              <div className="p-4 bg-water-light/50 rounded-full mb-6">
                <Upload className="h-10 w-10 text-water-deep" />
              </div>
              <h3 className="text-xl font-medium mb-3">Simple Import</h3>
              <p className="text-neutral-dark">
                Paste or upload your content and watch it transform instantly with smart formatting.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Preview Section */}
      <section className="relative bg-gradient-to-t from-background to-water-light py-20">
        <Wave position="top" color="text-background" className="absolute top-0 left-0 right-0" />
        
        <div className="container mx-auto px-4 py-10">
          <div className="max-w-5xl mx-auto">
            <h2 className="section-heading text-center">See DeepWaters in Action</h2>
            <p className="text-center text-lg mb-12 max-w-2xl mx-auto">
              Watch how your lengthy documents transform into beautifully structured, easy-to-navigate content.
            </p>
            
            <div className="water-card p-4 md:p-8 shadow-xl">
              <div className="rounded-lg overflow-hidden">
                <div className="aspect-video bg-water-light/40 flex items-center justify-center">
                  <div className="text-water-deep text-lg font-medium">
                    App Preview Coming Soon
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="section-heading text-center mb-16">What People Are Saying</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="water-card p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-water/20"></div>
                  <div className="ml-4">
                    <div className="font-medium">User {i}</div>
                    <div className="text-sm text-muted-foreground">Writer</div>
                  </div>
                </div>
                <p className="text-neutral-dark italic">
                  "DeepWaters has transformed how I organize my long-form content. The beautiful formatting and easy navigation make my planning documents a joy to read and use."
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="relative bg-water-deep text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-serif mb-6">Ready to dive deeper?</h2>
            <p className="text-xl mb-8">
              Start creating beautiful, structured documents today.
            </p>
            <Button size="lg" variant="secondary" className="bg-white hover:bg-gray-100 text-water-deep" asChild>
              <Link to="/start">
                Get Started Now
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Animated waves */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-10">
            <path 
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V120H0Z" 
              className="fill-background"
            ></path>
          </svg>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-10 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <Logo size="small" />
            <div className="mt-4 md:mt-0 text-neutral">
              © {new Date().getFullYear()} DeepWaters. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
