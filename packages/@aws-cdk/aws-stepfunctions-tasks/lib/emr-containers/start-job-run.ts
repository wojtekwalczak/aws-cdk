import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as sfn from '@aws-cdk/aws-stepfunctions';
import { Stack } from '@aws-cdk/core';

import { validatePatternSupported, integrationResourceArn } from './../private/task-utils';
import { ConfigurationOverridesPropertyToJson, JobDriverPropertyToJson } from './private/emr-containers-utils';
import { StartJobRunProps } from './start-job-run-props';


/**
 * Starts a job run.
 *
 * A job run is a unit of work, such as a Spark jar, PySpark script, or SparkSQL query, that you submit to Amazon EMR on EKS.
 *
 * @see https://docs.aws.amazon.com/emr-on-eks/latest/APIReference/API_StartJobRun.html
 *
 */
export class StartJobRun extends sfn.TaskStateBase {
    private static readonly SUPPORTED_INTEGRATION_PATTERNS: sfn.IntegrationPattern[] = [
        sfn.IntegrationPattern.REQUEST_RESPONSE,
        sfn.IntegrationPattern.RUN_JOB,
    ];

    protected readonly taskPolicies?: iam.PolicyStatement[];
    protected readonly taskMetrics?: sfn.TaskMetricsConfig;

    private readonly integrationPattern: sfn.IntegrationPattern;

    constructor(scope: Construct, id: string, private readonly props: StartJobRunProps) {
        super(scope, id, props);
        this.integrationPattern = props.integrationPattern ?? sfn.IntegrationPattern.RUN_JOB;

        validatePatternSupported(this.integrationPattern, StartJobRun.SUPPORTED_INTEGRATION_PATTERNS);
        this.taskPolicies = this.createPolicyStatements();
    }

    /**
     * @internal
     */
    protected _renderTask(): any {

        const jobRunProps = {
            Name: this.props.name,
            VirtualClusterId: cdk.stringToCloudFormation(this.props.virtualClusterId),
            ExecutionRoleArn: cdk.stringToCloudFormation(this.props.executionRoleArn),
            ReleaseLabel: cdk.stringToCloudFormation(this.props.releaseLabel),
            JobDriver: cdk.objectToCloudFormation(JobDriverPropertyToJson)(this.props.jobDriver),
            ConfigurationOverrides: cdk.objectToCloudFormation(ConfigurationOverridesPropertyToJson)(this.props.configurationOverrides),
            ...(this.props.tags ? this.renderTags(this.props.tags) : undefined),
        }

        return {
            Resource: integrationResourceArn('emr-containers', 'startJobRun', this.integrationPattern),
            Parameters: sfn.FieldUtils.renderObject(jobRunProps),
        };
    }

    private renderTags(tags: { [key: string]: any } | undefined): { [key: string]: any } {
        return tags ? { Tags: Object.keys(tags).map((key) => ({ Key: key, Value: tags[key] })) } : {};
    }

    /**
     * This generates the PolicyStatements required by the Task to call StartJobRun.
     */
    private createPolicyStatements(): iam.PolicyStatement[] {
        const stack = Stack.of(this);

        const policyStatements = [
            new iam.PolicyStatement({
                actions: [
                    'emr-containers:StartJobRun',
                    'emr-containers:DescribeJobRun',
                    'emr-containers:CancelJobRun',
                ],
                resources: [
                    stack.formatArn({
                        service: 'emr-containers',
                        resource: 'virtualclusters',
                        resourceName: '*',
                    }),
                    // StartJobRun fails if the resource lacks the slash as a prefix
                    stack.formatArn({
                        service: 'emr-containers',
                        resource: '/virtualclusters',
                        resourceName: '*',
                    }),
                ],
            }),
        ];

        if (this.integrationPattern === sfn.IntegrationPattern.RUN_JOB) {
            policyStatements.push(new iam.PolicyStatement({
                actions: ['events:PutTargets', 'events:PutRule', 'events:DescribeRule'],
                resources: [stack.formatArn({
                    service: 'events',
                    resource: 'rule',
                    resourceName: 'StepFunctionsEventsForEmrOnEksStartJobRunFlowStepsRule',
                })],
            }));
        }

        return policyStatements;
    }
}