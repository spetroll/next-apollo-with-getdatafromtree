import { useQuery } from "@apollo/client";
import type { NextPage } from "next";
import type { CustomPageContext } from "./_app";
import {
  AllFilmsData,
  GET_ALL_FILMS,
  AllPlanetsData,
  GET_ALL_PLANETS,
} from "../lib/queries";

type IndexPageProps = {};

const IndexPage: NextPage<IndexPageProps> = () => {
  // Two separate queries, to show how even queries not prefetched in `getInitialProps`
  // are rendered on the server (with the help of `getDataFromTree`)
  const { data: filmData } = useQuery<AllFilmsData>(GET_ALL_FILMS);
  const { data: planetData } = useQuery<AllPlanetsData>(GET_ALL_PLANETS);

  if (filmData && planetData) {
    return (
      <>
        <h2>Films</h2>
        <ul>
          {filmData.allFilms.films.map((f) => (
            <li key={f.id}>{f.title}</li>
          ))}
        </ul>

        <h2>Planets</h2>
        <ul>
          {planetData.allPlanets.planets.map((p) => (
            <li key={p.id}>{p.name}</li>
          ))}
        </ul>
      </>
    );
  }

  return null;
};

IndexPage.getInitialProps = async ({
  apolloClient,
}: CustomPageContext): Promise<IndexPageProps> => {
  // Prefetch data.
  await apolloClient.query({ query: GET_ALL_FILMS });

  // For demonstration purposes we don't pass the result as pageProps. It's cached in the apolloClient and
  // will be reused when the query is called again.
  return {};
};

export default IndexPage;
