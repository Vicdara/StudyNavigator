export class KeyRotator {
  private static currentIndexMap: Map<string, number> = new Map();

  /**
   * Retrieves the next active key from a pool using round-robin rotation.
   */
  static getNextKey(provider: string, pool: string[] = [], primaryKey?: string): string | undefined {
    const allKeys = Array.from(new Set([
      ...(primaryKey ? [primaryKey.trim()] : []),
      ...pool.map(k => k.trim()).filter(Boolean),
    ])).filter(k => k.length > 0);

    if (allKeys.length === 0) return undefined;

    const currentIndex = this.currentIndexMap.get(provider) || 0;
    const key = allKeys[currentIndex % allKeys.length];

    // Advance to next key for next request
    this.currentIndexMap.set(provider, (currentIndex + 1) % allKeys.length);
    return key;
  }

  /**
   * Gets all available keys in order starting from the current index.
   */
  static getAllKeysInRotationOrder(provider: string, pool: string[] = [], primaryKey?: string): string[] {
    const allKeys = Array.from(new Set([
      ...(primaryKey ? [primaryKey.trim()] : []),
      ...pool.map(k => k.trim()).filter(Boolean),
    ])).filter(k => k.length > 0);

    if (allKeys.length === 0) return [];

    const currentIndex = this.currentIndexMap.get(provider) || 0;
    const rotated: string[] = [];

    for (let i = 0; i < allKeys.length; i++) {
      rotated.push(allKeys[(currentIndex + i) % allKeys.length]);
    }

    return rotated;
  }

  /**
   * Advances the key index upon receiving a 429 rate limit or auth error.
   */
  static rotateOnFailure(provider: string, poolLength: number): void {
    if (poolLength <= 1) return;
    const currentIndex = this.currentIndexMap.get(provider) || 0;
    this.currentIndexMap.set(provider, (currentIndex + 1) % poolLength);
  }
}
