import React, { useEffect, useState } from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import _get from 'lodash/get';
import Image from '../../components/image';
import { Layout } from '../../components/layout';
import { fetch } from '../../helpers/request';

const styles = {
  tags: {
    marginRight: 15,
    textTransform: 'capitalize'
  }
};

function Detail() {
  const router = useRouter();
  const { id } = router.query;
  const [state, setState] = useState({
    info: {},
    categories: [],
    infoStatus: false
  });

  useEffect(() => {
    setState((existingState) => ({
      ...existingState,
      infoStatus: true
    }));

    const fetchInfo = async () => {
      if (!router.isReady) return;
      const _info = await fetch(`/anime/${id}`);

      setState((existingState) => ({
        ...existingState,
        info: _get(_info, 'data.data') || {},
        categories: [],
        infoStatus: false
      }));
    };

    const fetchCategories = async () => {
      if (!router.isReady) return;

      const categories = await fetch(`/anime/${id}/relationships/categories`);

      if (categories?.data?.data?.length) {
        let hydrateCategories = [];

        for (let category of categories.data.data) {
          const categoryData = await fetch(`/categories/${category.id}`);

          if (!categoryData.errors) {
            const { attributes, relationships, id } = categoryData.data.data;

            hydrateCategories.push({
              id,
              title: attributes.title,
              relatedAnimesLink: relationships?.anime?.links?.related
            });
          }
        }

        if (hydrateCategories.length) {
          setState((existingState) => ({
            ...existingState,
            categories: hydrateCategories || [],
            infoStatus: false
          }));
        }
      }
    };

    fetchInfo();
    fetchCategories();
  }, [router.isReady, id]);

  return (
    <Layout>
      Detail page
      {state.infoStatus && ('Loading ...')}
      <Container maxWidth="xl">
        <Box>
          {state.info?.attributes?.coverImage?.large && (
            <Image
              style={{ width: '100%', height: 'auto' }}
              src={state.info.attributes.coverImage.large}
              alt="some_alt_text"
            />
          )}
        </Box>
        <Box>
          <Typography variant="h6" color="text.secondary">
            Synopsis:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {state.info.attributes?.synopsis}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {state.info.attributes?.titles?.ja_jp}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {state.info.attributes?.titles?.en_jp}
          </Typography>
          {state.categories.map((category) => (
            <Button
              variant="outlined"
              style={styles.tags}
              key={category.id}
              href={category.relatedAnimesLink}>
              {category.title}
            </Button>
          ))}
        </Box>
      </Container>
    </Layout>
  );
}

export default Detail;
