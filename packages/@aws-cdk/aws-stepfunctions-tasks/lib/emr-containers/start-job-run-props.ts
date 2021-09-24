import * as sfn from '@aws-cdk/aws-stepfunctions';

/**
 * A configuration specification to be used when provisioning virtual clusters,
 * which can include configurations for applications and software bundled with Amazon EMR on EKS.
 *
 * A configuration consists of a classification, properties, and optional nested configurations.
 *
 * A classification refers to an application-specific configuration file.
 *
 * Properties are the settings you want to change in that file.
 *
 * @see https://docs.aws.amazon.com/emr-on-eks/latest/APIReference/API_Configuration.html
 */
export interface Configuration {

    /**
     * The classification within a configuration.
     */
    readonly classification: string;

    /**
     * A list of additional configurations to apply within a configuration object.
     *
     * Required: no.
     */
    readonly configurations?: string[];

    /**
     * A set of properties specified within a configuration classification.
     *
     * Required: no.
     */
    readonly properties?: Record<string, string>;
}

/**
 *
 * A configuration for CloudWatch monitoring. You can configure your jobs to send log information to CloudWatch Logs.
 *
 * @see https://docs.aws.amazon.com/emr-on-eks/latest/APIReference/API_CloudWatchMonitoringConfiguration.html
 */
export interface CloudWatchMonitoringConfiguration {
    /**
     * The name of the log group for log publishing.
     */
    readonly logGroupName: string;

    /**
     * The specified name prefix for log streams.
     */
    readonly logStreamNamePrefix?: string;
}

/**
 * Amazon S3 configuration for monitoring log publishing. You can configure your jobs to send log information to Amazon S3.
 *
 * @see https://docs.aws.amazon.com/emr-on-eks/latest/APIReference/API_S3MonitoringConfiguration.html
 */
export interface S3MonitoringConfiguration {
    /**
     * Amazon S3 destination URI for log publishing.
     *
     * Required: yes.
     */
    readonly logUri: string;
}

/**
 * Configuration setting for monitoring.
 *
 * @see https://docs.aws.amazon.com/emr-on-eks/latest/APIReference/API_MonitoringConfiguration.html
 */
export interface MonitoringConfiguration {
    /**
     * Monitoring configurations for CloudWatch.
     *
     * Required: no.
     */
    readonly cloudWatchMonitoringConfiguration?: CloudWatchMonitoringConfiguration;

    /**
     * Monitoring configurations for the persistent application UI.
     *
     * Valid Values: ENABLED | DISABLED
     * Required: no.
     */
    readonly persistentAppUI?: string

    /**
     * Amazon S3 configuration for monitoring log publishing.
     *
     * Required: no.
     */
    readonly s3MonitoringConfiguration?: S3MonitoringConfiguration

}

/**
 * A configuration specification to be used to override existing configurations.
 *
 * @see https://docs.aws.amazon.com/emr-on-eks/latest/APIReference/API_ConfigurationOverrides.html
 */
export interface ConfigurationOverrides {

    /**
     * The configurations for the application running by the job run.
     */
    readonly applicationConfiguration?: Configuration[];

    /**
     * The configurations for monitoring.
     */
    readonly monitoringConfiguration?: MonitoringConfiguration;
}

/**
 * The information about job driver for Spark submit.
 *
 * @see: https://docs.aws.amazon.com/emr-on-eks/latest/APIReference/API_SparkSubmitJobDriver.html
 */
export interface SparkSubmitJobDriver {
    /**
     * The entry point of job application.
     *
     * Required: yes.
     */
    readonly entryPoint: string;

    /**
     * The arguments for job application.
     *
     * Required: no.
     */
    readonly entryPointArguments?: string[];

    /**
     * The Spark submit parameters that are used for job runs.
     *
     * Required: no.
     */
    readonly sparkSubmitParameters?: string
}

/**
 * Specify the driver that the job runs on.
 *
 * @see: https://docs.aws.amazon.com/emr-on-eks/latest/APIReference/API_JobDriver.html
 */
export interface JobDriver {
    /**
     * The job driver parameters specified for spark submit.
     *
     * Required: no.
     */
    readonly sparkSubmitJobDriver?: SparkSubmitJobDriver;
}

/**
 * Properties for StartJobRun.
 */
export interface StartJobRunProps extends sfn.TaskStateBaseProps {
    /**
     * The virtual cluster ID for which the job run request is submitted.
     *
     * Required: yes.
     *
     * @see https://docs.aws.amazon.com/emr-on-eks/latest/APIReference/API_StartJobRun.html
     */
    readonly virtualClusterId: string;

    /**
     * The configuration overrides for the job run.
     *
     * Required: no.
     *
     * @see https://docs.aws.amazon.com/emr-on-eks/latest/APIReference/API_StartJobRun.html
     *
     * @default - no Configuration Overrides.
     */
    readonly configurationOverrides?: ConfigurationOverrides;

    /**
     * The execution role ARN for the job run.
     *
     * Required: yes.
     *
     * @see https://docs.aws.amazon.com/emr-on-eks/latest/APIReference/API_StartJobRun.html
     */
    readonly executionRoleArn: string;

    /**
     * The job driver for the job run.
     *
     * Required: yes.
     */
    readonly jobDriver: JobDriver;

    /**
     * The name of the job run.
     *
     * @see https://docs.aws.amazon.com/emr-on-eks/latest/APIReference/API_StartJobRun.html
     */
    readonly name: string;

    /**
     * The Amazon EMR release version to use for the job run.
     *
     * Required: yes.
     *
     * @see: https://docs.aws.amazon.com/emr-on-eks/latest/APIReference/API_StartJobRun.html
     */
    readonly releaseLabel: string;

    /**
     * The tags assigned to job runs.
     *
     * @see: https://docs.aws.amazon.com/emr-on-eks/latest/APIReference/API_StartJobRun.html
     *
     * @default - No tags
     */
    readonly tags?: Record<string, string>

}
