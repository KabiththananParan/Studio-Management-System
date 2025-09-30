import React from 'react';
import PropTypes from 'prop-types';
import { studioPackages } from '../data/constants';
import { PackageCard } from '../components';

const HomePage = ({ onPackageSelect }) => {
  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Professional Photography Studio Packages
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Choose from our premium photography packages designed for photographers, models, and content creators. 
          Each package includes professional camera equipment, lighting systems, and comprehensive studio services.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {studioPackages.map(pkg => (
          <PackageCard 
            key={pkg.id} 
            package={pkg} 
            onSelect={onPackageSelect} 
          />
        ))}
      </div>
    </div>
  );
};

// PropTypes validation
HomePage.propTypes = {
  onPackageSelect: PropTypes.func.isRequired
};

export default HomePage;