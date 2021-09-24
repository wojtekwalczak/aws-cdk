import * as cdk from '@aws-cdk/core';
import { ConfigurationOverrides, JobDriver } from '../start-job-run-props';

export function JobDriverPropertyToJson(property: JobDriver) {
    return {
        SparkSubmitJobDriver: {
            EntryPoint: cdk.stringToCloudFormation(property.sparkSubmitJobDriver?.entryPoint),
            EntryPointArguments: cdk.stringToCloudFormation(property.sparkSubmitJobDriver?.entryPointArguments),
            SparkSubmitParameters: cdk.stringToCloudFormation(property.sparkSubmitJobDriver?.sparkSubmitParameters)
        }
    }
}

export function ConfigurationOverridesPropertyToJson(property: ConfigurationOverrides) {
    return {
        ApplicationConfiguration: cdk.objectToCloudFormation(property.applicationConfiguration?.map(c => {
            return {
                Classification: c.classification,
                Configurations: c.configurations,
                Properties: c.properties
            }
        })),
        MonitoringConfiguration: {
            CloudWatchMonitoringConfiguration: {
                LogGroupName: cdk.stringToCloudFormation(property.monitoringConfiguration?.cloudWatchMonitoringConfiguration?.logGroupName),
                LogStreamNamePrefix: cdk.stringToCloudFormation(property.monitoringConfiguration?.cloudWatchMonitoringConfiguration?.logStreamNamePrefix),
            },
            PersistentAppUI: cdk.objectToCloudFormation(property.monitoringConfiguration?.persistentAppUI),
            S3MonitoringConfiguration: cdk.objectToCloudFormation(property.monitoringConfiguration?.s3MonitoringConfiguration)
        }
    }
}
