"use client";

import {
    useState,
    type ReactNode
} from "react";

import { Box, MobileStepper, Button, useMediaQuery, NoSsr, Stepper, Step, StepLabel, StepConnector, Container, Typography, Collapse } from '@mui/material';
import { useTheme, styled } from "@mui/material/styles";
import { stepConnectorClasses } from '@mui/material/StepConnector';
import { type StepIconProps } from '@mui/material/StepIcon';



import {
    AccountCircle as AccountCircleIcon,
    Camera as CameraIcon,
    TaskAlt as TaskAltIcon,
    ArrowBack as ArrowBackIcon,
    Save as SaveIcon,
    Restore as RestoreIcon,
    PhotoCamera as PhotoCameraIcon,
    RemoveCircleOutline as RemoveCircleOutlineIcon,
    EventBusy as EventBusyIcon,
    PersonSearch as PersonSearchIcon,
    ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";


import {
    useForm,
    Controller,
    type SubmitHandler,
    type FieldErrors,
    type FieldPath,
} from "react-hook-form";



import { type DateValue } from "@/types";
import { tr } from "date-fns/locale";

const steps = ['Select campaign settings', 'Create an ad group', 'Create an ad'];

type TFormInputs = {
    firstName: string;
    lastName: string;
    email: string;
    roles: string[];
    unavailableDates?: DateValue[];
    photoFile?: File | string;
    notes?: string;
};

type TStepField = FieldPath<TFormInputs>;


type TStepConfig = {
    label: string;
    description: string;
    icon: ReactNode;
    fields: TStepField[];
};

const stepConfigs: TStepConfig[] = [
    {
        label: "Identity",
        description: "Contact details",
        icon: <AccountCircleIcon />,
        fields: ["firstName", "lastName", "email"],
    },
    {
        label: "Photo & Availability",
        description: "Optional scheduling context",
        icon: <CameraIcon />,
        fields: ["photoFile", "unavailableDates"],
    },
    {
        label: "Roles & Notes",
        description: "Service responsibilities",
        icon: <TaskAltIcon />,
        fields: ["roles", "notes"],
    },
];

const StepperConnector = styled(StepConnector)(({ theme }) => ({
    [`&.${stepConnectorClasses}`]: {
        transition: "all 0.9s ease-in-out",
    },
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
        top: 16,
        left: "calc(-50% + 25px)",
        right: "calc(50% + 25px)",
    },
    [`&.${stepConnectorClasses.active}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            borderColor: theme.palette.primary.main,
        },
    },
    [`&.${stepConnectorClasses.completed}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            borderColor: theme.palette.success.main,
        },
    },
    [`& .${stepConnectorClasses.line}`]: {
        borderColor: theme.palette.divider,
        borderTopWidth: 2,
        borderRadius: 2,
    },
}));

const StepIconRoot = styled("div")<{ ownerState: { active?: boolean } }>(
    ({ theme }) => ({
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 36,
        height: 36,
        borderRadius: "50%",
        color: theme.palette.common.white,
        backgroundColor: theme.palette.grey[400],
        transition: "all 0.2s ease",
        ...theme.applyStyles("dark", {
            backgroundColor: theme.palette.grey[700],
        }),
        variants: [
            {
                props: ({ ownerState }) => ownerState.active,
                style: {
                    backgroundColor: theme.palette.primary.main,
                },
            },
        ],
    }),
);

const StepStatusIcon = (props: StepIconProps) => {
    const { active, completed, className, icon } = props;
    const stepIndex =
        typeof icon === "number" ? icon - 1 : Number(icon ?? 1) - 1;
    const configIcon = stepConfigs[stepIndex]?.icon;

    return (
        <StepIconRoot
            className={className}
            ownerState={{ active }}
            sx={{
                backgroundColor: completed ? "success.main" : undefined,
            }}
        >
            {configIcon ?? icon}
        </StepIconRoot>
    );
};


export default function AddMan() {
    const [activeStep, setActiveStep] = useState(0);
    const [completed, setCompleted] = useState<{
        [k: number]: boolean;
    }>({});

    const totalSteps = () => {
        return steps.length;
    };

    const completedSteps = () => {
        return Object.keys(completed).length;
    };

    const isLastStep = () => {
        return activeStep === totalSteps() - 1;
    };

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up("md"), {
        noSsr: true,
        defaultMatches: false,
    });



    return (
        <NoSsr>
            <Container maxWidth="lg" sx={{ py: 4 }}>

                {steps.map((label, index) => (
                    <Collapse
                        key={label}
                        in={activeStep === index}
                        timeout="auto"
                        unmountOnExit
                    >
                        <Box sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                            <Typography variant="h6" gutterBottom>
                                {label}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec eget
                                pharetra ligula, sed efficitur lorem. Ut sollicitudin, erat id
                                gravida tristique, arcu erat egestas erat, sit amet vulputate ante
                                mauris non orci.
                            </Typography>
                        </Box>
                    </Collapse>
                ))}

                {isDesktop ? (
                    <>
                        <Stepper activeStep={activeStep} connector={<StepperConnector />} alternativeLabel>
                            {stepConfigs.map((step, index) => {
                                return (
                                    <Step key={step.label}>
                                        <StepLabel slots={{ stepIcon: StepStatusIcon }} optional={
                                            <Typography variant="caption">
                                                {step.description}
                                            </Typography>
                                        }>{step.label}</StepLabel>
                                    </Step>
                                )
                            })}
                        </Stepper>

                        <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
                            Back
                        </Button>

                        <Button size="small" onClick={handleNext} disabled={isLastStep()}>
                            Next
                        </Button>
                    </>

                ) : <MobileStepper
                    variant="dots"
                    steps={3}
                    position="static"
                    activeStep={activeStep}
                    sx={{ maxWidth: 400, flexGrow: 1 }}
                    nextButton={
                        <Button size="small" onClick={handleNext} disabled={isLastStep()}>
                            Next

                        </Button>
                    }
                    backButton={
                        <Button size="small" onClick={handleBack} disabled={activeStep === 0}>

                            Back
                        </Button>
                    }
                />}
            </Container>
        </NoSsr>
    );
}
