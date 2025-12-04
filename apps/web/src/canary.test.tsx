import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

describe('Web Canary Test', () => {
    it('should pass if setup is correct', () => {
        expect(true).toBe(true)
    })

    it('should render a simple element', () => {
        render(<div data-testid="canary">Tweet</div>)
        expect(screen.getByTestId('canary')).toBeInTheDocument()
        expect(screen.getByText('Tweet')).toBeInTheDocument()
    })
})
