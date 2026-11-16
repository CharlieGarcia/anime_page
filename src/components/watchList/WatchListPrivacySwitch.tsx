import React from 'react';
import PrivacySwitch from '@/components/profile/PrivacySwitch';

// Whether the signed-in user's watch list shows on their public profile
const WatchListPrivacySwitch = () => (
  <PrivacySwitch
    setting="watchListPublic"
    label="Show my watch list on my public profile"
  />
);

export default WatchListPrivacySwitch;
