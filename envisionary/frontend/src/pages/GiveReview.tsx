import '../App.css'
import Card from '@mui/material/Card';
import { Autocomplete, Button, Rating, TextField, Typography } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { Box } from '@mui/system';
import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_COUNTRY_NAMES } from "../graphql/queries";
import { ADD_REVIEW } from "../graphql/mutations"
import { ICountry } from "../types";


function GiveReview() {
  const [country, setCountry] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [author, setAuthor] = useState('');
  const [reviewText, setReviewText] = useState('');

  const { loading, error, data } = useQuery(GET_COUNTRY_NAMES);

  let countryNames: Array<{ label: string }> = [];

  const getCountryNames = () => {
    if (loading) return [{ label: "Loading available countries ... " }];
    if (error) return [{ label: "Could not find any countries to review" }];

    data.countries.map((country: ICountry) => {
      if (country.Country !== null) { // some countries might have null values. Do not include them
        countryNames.push({ label: country.Country })
      }
    })
    return countryNames;
  };

  // Use ADD_REVIEW mutation to add review to database
  const [addReview] = useMutation(ADD_REVIEW);

  const reviewHeaderStyling = { mt: 3, fontSize: '18px' }

  // TODO: Tilbakemelding til brukeren ved feil input
  return (
    <Card component="main" sx={{
      m: '3%', width: '50%', maxWidth: 700, minWidth: '510px', display: 'flex', justifyContent: 'center',
      alignItems: 'center', p: 6
    }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <Typography variant="h4">Give review</Typography>
        <Typography variant="h6" sx={reviewHeaderStyling}>Choose a country</Typography>
        <Autocomplete
          disablePortal
          id="combo-box-demo"
          options={getCountryNames()}
          sx={{ width: 250 }}
          inputValue={country}
          onInputChange={(event, newInputValue) => {
            setCountry(newInputValue);
          }}
          renderInput={(params) => <TextField {...params} label="" aria-label="CountryName" placeholder="Country" required={true} />}
          isOptionEqualToValue={(option, value) => option.label === value.label}
        />

        <Typography variant="h6" sx={reviewHeaderStyling}>Name</Typography>
        <TextField id="name-field"
          required
          label=""
          aria-label="Name"
          placeholder="Name"
          variant="outlined"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />

        <Typography variant="h6" sx={reviewHeaderStyling}>Rating</Typography>
        <Rating
          name="hover-feedback"
          aria-label="Rating"
          value={rating}
          precision={0.5}
          // getLabelText={getLabelText}
          onChange={(event, newValue) => {
            newValue === null ? setRating(0) : setRating(newValue);
          }}
          emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
        />

        <Typography variant="h6" sx={reviewHeaderStyling}>Review Content</Typography>
        <TextField
          id="outlined-multiline-static"
          label=""
          aria-label="Review content"
          placeholder="Write your review..."
          multiline
          rows={7}
          sx={{ width: '50vw', maxWidth: 500 }}
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
        />

        <Button variant="contained"
          sx={{ backgroundColor: '#172A3A', '&:hover': { backgroundColor: '#172A3A' }, mt: 3, mb: 2 }}
          onClick={(event) => {
            event.preventDefault();
            country && addReview({
              variables:
              {
                country: country,
                name: author,
                reviewText: reviewText,
                date: new Date().toISOString(),
                rating: rating
              }
            });
            setCountry(""); // TODO: this does nothing, ideally we want to unselect country in dropdown too
            setAuthor("");
            setReviewText("");
            setRating(0);
          }}
        >
          Submit
        </Button>
      </Box>
    </Card>
  );
}

export default GiveReview;
