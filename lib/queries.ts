import { gql } from "@apollo/client";

export interface AllFilmsData {
  allFilms: { films: Array<{ id: string; title: string }> };
}
export interface AllPlanetsData {
  allPlanets: { planets: Array<{ id: string; name: string }> };
}

export const GET_ALL_FILMS = gql`
  query getAllFilms {
    allFilms {
      films {
        id
        title
      }
    }
  }
`;

export const GET_ALL_PLANETS = gql`
  query getAllPlanets {
    allPlanets {
      planets {
        id
        name
      }
    }
  }
`;
