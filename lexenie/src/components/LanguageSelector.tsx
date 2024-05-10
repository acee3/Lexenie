import React from 'react';

interface LanguageSelectorProps {
  
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({  }) => {
  return (
    <div className="content-center">
      <p className="p-2 border-black border-4 rounded-lg hover:border-dotted center text-4xl">
        English
      </p>
    </div>
  );
};

export default LanguageSelector;
