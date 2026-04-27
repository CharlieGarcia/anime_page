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
    justifyContent: 'space-between'
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
  return (
    <div>
      <Accordion>
        <AccordionSummary
          expandIcon={<ArrowDropDownIcon />}
          aria-controls="panel2-content"
          id="panel2-header">
          <Typography component="span">{title}</Typography>
        </AccordionSummary>
        <AccordionDetails sx={styles.accordion}>
          {thumbnailUrl && (
            <Image sx={styles.image} src={thumbnailUrl} alt="some_alt_text" />
          )}
          {synopsis && <Typography sx={styles.synopsis}>{synopsis}</Typography>}
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
