import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import _get from 'lodash/get';
import { fetch } from '../helpers/request';

function Detail() {
  const { id } = useParams();
  const [info, setInfo] = useState({});

  useEffect(async () => {
    const _info = await fetch(`/anime/${id}`);

    setInfo(_get(_info, 'data.data') || {});
  }, []);

  return (
    <div>
      Detail page
      <p>`${JSON.stringify(info, null, 2)}`</p>
    </div>
  );
}

export default Detail;
