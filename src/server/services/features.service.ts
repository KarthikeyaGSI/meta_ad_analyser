import { db } from '../db';
import { planFeatures, licenses, licenseActivations } from '../db/schema';
import { eq } from 'drizzle-orm';

export class FeatureService {
  /**
   * Retrieves all feature flags for a given active license/activation
   */
  static async getFeaturesForActivation(activationId: string) {
    const [activation] = await db.select().from(licenseActivations).where(eq(licenseActivations.id, activationId));
    if (!activation) throw new Error('Activation not found');

    const [license] = await db.select().from(licenses).where(eq(licenses.id, activation.licenseId));
    if (!license) throw new Error('License not found');

    const features = await db.select().from(planFeatures).where(eq(planFeatures.planId, license.planId));
    
    // Reduce array to key-value map
    return features.reduce((acc, f) => {
      acc[f.featureKey] = f.featureValue;
      return acc;
    }, {} as Record<string, any>);
  }

  static async checkFeatureAccess(activationId: string, featureKey: string): Promise<boolean> {
    const features = await this.getFeaturesForActivation(activationId);
    return !!features[featureKey];
  }
}
