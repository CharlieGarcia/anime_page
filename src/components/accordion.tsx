import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  SxProps
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Image from './image';

type CustomAccordionProps = {
  title: string;
  synopsis?: string;
  thumbnailUrl?: string;
};

const styles: Record<string, SxProps> = {
  accordion: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: '16px'
  },
  image: {
    width: '25%',
    height: 'auto'
  },
  synopsis: {
    width: '73%'
  }
};

export default function CustomAccordion({
  title,
  synopsis,
  thumbnailUrl
}: CustomAccordionProps): JSX.Element {
  const id = React.useId();

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ArrowDropDownIcon />}
        aria-controls={id + '-content'}
        id={id + '-header'}>
        <Typography component="span">{title}</Typography>
      </AccordionSummary>
      <AccordionDetails sx={styles.accordion}>
        {thumbnailUrl && (
          <Image sx={styles.image} src={thumbnailUrl} alt={title} />
        )}
        {synopsis && <Typography sx={styles.synopsis}>{synopsis}</Typography>}
      </AccordionDetails>
    </Accordion>
  );
}
