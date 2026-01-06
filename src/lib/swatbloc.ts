import { SwatBloc } from '@swatbloc/sdk'

// Initialize with public API key from environment
const apiKey = process.env.NEXT_PUBLIC_SWATBLOC_KEY

if (!apiKey) {
    console.warn('NEXT_PUBLIC_SWATBLOC_KEY is not set. SDK features will not work.')
}

export const swat = new SwatBloc(apiKey || '')
