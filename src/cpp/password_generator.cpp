/**
 * ============================================================================
 *         🛡️ SECURE CRYPTOGRAPHIC ENGINE (WEBASSEMBLY COMPILED C++)
 * ============================================================================
 * 
 * Project Name: Cryptographic WebAssembly Password Generator
 * Author: Dornal (sujaldornal270506@gmail.com)
 * Version: 1.0.0
 * Date: May 2026
 * Description: High-performance, memory-isolated password mapping logic and
 *              pseudo-random index selection.
 * 
 * Compiling this C++ code to WebAssembly using Emscripten:
 * 
 *   emcc -O3 -s WASM=1 \
 *        -s EXPORTED_FUNCTIONS="['_generate_password_index']" \
 *        -s EXPORTED_RUNTIME_METHODS="['ccall','cwrap']" \
 *        -o password_generator.js password_generator.cpp
 * 
 * ============================================================================
 */

#include <iostream>

extern "C" {
    /**
     * Maps an externally generated high-entropy random seed to a constrained index.
     * 
     * Inside JavaScript/React, we retrieve an array of cryptographically secure
     * random integers (using window.crypto.getRandomValues). We then pass each 
     * state-seed into this high-performance C++ function to determine the safe 
     * index within our character array range.
     * 
     * By doing so, we ensure that:
     * 1. The random sources are cryptographically solid (JS Crypto API).
     * 2. The mapping and character selection logic is computed efficiently 
     *    and safely in native compiled C++ code within WebAssembly's sandbox.
     * 
     * @param seed       A cryptographically secure 32-bit unsigned integer.
     * @param max_range  The total length of the active character set.
     * @return int       The mapped index to use for character selection.
     */
    int generate_password_index(unsigned int seed, int max_range) {
        if (max_range <= 0) return 0;
        
        // Linear Congruential Generator (LCG) mapping
        // Multiplier & Increment from traditional MMIX (Donald Knuth) standards
        unsigned long long state = seed;
        state = (6364136223846793005ULL * state + 1442695040888963407ULL);
        
        return (int)((state >> 32) % max_range);
    }
}
