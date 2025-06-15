import React from 'react';
import './PropertyAnalysis.css';
import { 
  PropertyData, 
  DistanceInfo, 
  LocationDistance 
} from '../types/property';

interface PropertyAnalysisProps {
  url: string;
  onUrlChange: (url: string) => void;
  onSubmit: (url: string) => void;
  propertyData: PropertyData | null;
  distanceInfo: DistanceInfo | null;
  error: string | null;
  isLoading: boolean;
  onNext: () => void;
  onBack: () => void;
}

const PropertyAnalysis: React.FC<PropertyAnalysisProps> = ({
  url,
  onUrlChange,
  onSubmit,
  propertyData,
  distanceInfo,
  error,
  isLoading,
  onNext,
  onBack
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(url);
  };

  const renderDistanceInfo = (category: string, locations: LocationDistance[] | undefined) => {
    if (!locations || locations.length === 0) return null;
    
    return (
      <div key={category} className="distance-category">
        <h5>{category.replace('_', ' ').toUpperCase()}</h5>
        <ul>
          {locations.map((location, index) => (
            <li key={index}>
              <div className="location-name">
                {category === 'groceries' && location.store_info 
                  ? location.store_info.display_name 
                  : location.destination}
              </div>
              {category === 'groceries' && location.store_info && (
                <div className="store-address">
                  {location.store_info.formatted_address}
                </div>
              )}
              <div className="location-details">
                <span>Distance: {location.distance.text}</span>
                {location.modes.driving && (
                  <span>Drive: {location.modes.driving.current?.text}</span>
                )}
                {location.modes.transit && (
                  <span>Transit: {location.modes.transit.current?.text}</span>
                )}
                {location.modes.walking && (
                  <span>Walk: {location.modes.walking.current?.text}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="property-analysis">
      <div className="stage-card">
        <h2 className="stage-title">Stage 3: Analyze Properties</h2>
        <form onSubmit={handleSubmit} className="property-form">
          <div className="form-group">
            <label htmlFor="propertyUrl">Domain.com.au Property URL</label>
            <input
              type="url"
              id="propertyUrl"
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
              placeholder="https://www.domain.com.au/..."
              required
              pattern="https://www\.domain\.com\.au/.*"
              title="Please enter a valid Domain.com.au URL"
            />
            <small>Enter a property URL from Domain.com.au to analyze</small>
          </div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Analyzing...' : 'Analyze Property'}
          </button>
        </form>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {propertyData && (
          <div className="property-details">
            <h3>Property Details</h3>
            <div className="property-grid">
              <div className="property-card">
                <h4>Location</h4>
                <p>{propertyData.address.full_address}</p>
              </div>

              <div className="property-card">
                <h4>Property Info</h4>
                <p className="title">{propertyData.basic_info.title}</p>
                <p className="type">{propertyData.basic_info.property_type}</p>
                {propertyData.basic_info.price && (
                  <p className="price">${propertyData.basic_info.price.toLocaleString()}</p>
                )}
              </div>

              <div className="property-card">
                <h4>Features</h4>
                <ul>
                  <li>{propertyData.features.bedrooms} Bedrooms</li>
                  <li>{propertyData.features.bathrooms} Bathrooms</li>
                  {propertyData.features.parking !== null && (
                    <li>{propertyData.features.parking} Parking Spaces</li>
                  )}
                  {propertyData.features.property_size !== null && (
                    <li>Property Size: {propertyData.features.property_size}m²</li>
                  )}
                  {propertyData.features.land_size !== null && (
                    <li>Land Size: {propertyData.features.land_size}m²</li>
                  )}
                </ul>
              </div>

              {distanceInfo && (
                <div className="property-card full-width">
                  <h4>Nearby Amenities</h4>
                  <div className="distance-info">
                    {Object.entries(distanceInfo).map(([category, locations]) => 
                      renderDistanceInfo(category, locations)
                    )}
                  </div>
                </div>
              )}

              {propertyData.description && (
                <div className="property-card full-width">
                  <h4>Description</h4>
                  <p className="description">{propertyData.description}</p>
                </div>
              )}

              {propertyData.images && propertyData.images.length > 0 && (
                <div className="property-card full-width">
                  <h4>Images</h4>
                  <div className="property-images">
                    {propertyData.images.map((image, index) => (
                      <img key={index} src={image} alt={`Property images pulled from domain ${index + 1}`} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="navigation-buttons">
          <button onClick={onBack} className="back-button">Back</button>
        </div>
      </div>
    </div>
  );
};

export default PropertyAnalysis; 