'use server';
import { searchClient } from '@algolia/client-search';

const ALGOLIA_PROJECT_ID = process.env.ALGOLIA_PROJECT_ID || '';
const ALGOLIA_SEARCH_KEY = process.env.ALGOLIA_KEY || '';

// Helper function to get client
const getClient = () => {
  if (!ALGOLIA_PROJECT_ID || !ALGOLIA_SEARCH_KEY) {
    throw new Error('Algolia credentials are not configured');
  }
  return searchClient(ALGOLIA_PROJECT_ID, ALGOLIA_SEARCH_KEY);
};

export async function verifyNFTOwnership(owner: string, collection: string, indexName: string = 'mainnet'): Promise<boolean> {
  try {
    const client = getClient();
    const searchResponse = await client.searchSingleIndex({
      indexName,
      searchParams: {
        query: '',
        filters: `chain:mainnet AND collection:"${collection}" AND owner:"${owner}"`,
        hitsPerPage: 1,
      }
    });

    return (searchResponse?.hits?.length ?? 0) > 0;
  } catch (error) {
    console.error('Error verifying NFT ownership:', error);
    return false;
  }
}

export async function getNFTsByOwner(owner: string, collection: string, indexName: string = 'mainnet') {
  try {
    const client = getClient();
    const searchResponse = await client.searchSingleIndex({
      indexName,
      searchParams: {
        query: '',
        filters: `chain:mainnet AND collection:"${collection}" AND owner:"${owner}"`,
      }
    });

    return searchResponse?.hits ?? [];
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    return [];
  }
}