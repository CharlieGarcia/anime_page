import React from 'react';
import PrivacySwitch from '@/components/profile/PrivacySwitch';

// Whether the signed-in user's top 10 shows on their public profile
const TopAnimePrivacySwitch = () => (
  <PrivacySwitch
    setting="topAnimePublic"
    label="Show my top 10 on my public profile"
  />
);

export default TopAnimePrivacySwitch;
