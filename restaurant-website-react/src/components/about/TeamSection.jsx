import React from "react";

const TeamSection = () => {
  const team = [
    {
      name: "Michael Chen",
      role: "Head Chef",
      image:
        "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&h=400&fit=crop",
      description: "20+ years crafting culinary masterpieces",
    },
    {
      name: "Sarah Martinez",
      role: "Pastry Chef",
      image:
        "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop",
      description: "Award-winning dessert specialist",
    },
    {
      name: "James Anderson",
      role: "Executive Chef",
      image:
        "https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=400&h=400&fit=crop",
      description: "Innovative fusion cuisine expert",
    },
    {
      name: "Emily Wong",
      role: "Sous Chef",
      image:
        "https://images.unsplash.com/photo-1581299894007-aaa50297cf16?w=400&h=400&fit=crop",
      description: "Japanese cuisine specialist",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-white via-cream-light to-white">
      <div className="container mx-auto px-6 sm:px-6 lg:px-16">
        <div className="text-center mb-16">
          <h2 className="font-display text-5xl text-dark mb-4">
            Meet Our Culinary Team
          </h2>
          <p className="text-dark-gray text-xl max-w-2xl mx-auto">
            Passionate chefs dedicated to creating extraordinary dining
            experiences
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, index) => (
            <div
              key={index}
              className="group bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="relative overflow-hidden h-64">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              </div>
              <div className="p-6 text-center">
                <h3 className="font-display text-2xl text-dark mb-2">
                  {member.name}
                </h3>
                <div className="text-primary font-semibold mb-3">
                  {member.role}
                </div>
                <p className="text-dark-gray text-sm">
                  {member.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
