import React from "react";

const TimelineSection = () => {
  const timeline = [
    {
      year: "2009",
      title: "The Beginning",
      description:
        "Started as a small family kitchen with a dream to serve authentic, delicious food to our community.",
    },
    {
      year: "2012",
      title: "First Restaurant",
      description:
        "Opened our first brick-and-mortar location, quickly becoming a neighborhood favorite.",
    },
    {
      year: "2016",
      title: "Menu Expansion",
      description:
        "Expanded our menu to include international cuisines, bringing global flavors to our customers.",
    },
    {
      year: "2020",
      title: "Digital Transformation",
      description:
        "Launched online ordering and delivery service, making our food accessible to everyone, anywhere.",
    },
    {
      year: "2024",
      title: "Community Impact",
      description:
        "Proud to serve 50,000+ customers and support local farmers and sustainable practices.",
    },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-6 sm:px-6 lg:px-16">
        <div className="text-center mb-16">
          <h2 className="font-display text-5xl text-dark mb-4">
            Our Journey
          </h2>
          <p className="text-dark-gray text-xl">
            Milestones that shaped who we are today
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {timeline.map((item, index) => (
            <div
              key={index}
              className="relative pl-8 pb-12 border-l-4 border-primary/20 last:pb-0"
            >
              <div className="absolute left-0 top-0 w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-full transform -translate-x-[18px] flex items-center justify-center text-white font-bold shadow-lg">
                ✓
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all border-2 border-primary/10 ml-8">
                <div className="text-primary font-bold text-xl mb-2">
                  {item.year}
                </div>
                <h3 className="font-display text-2xl text-dark mb-3">
                  {item.title}
                </h3>
                <p className="text-dark-gray leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TimelineSection;
