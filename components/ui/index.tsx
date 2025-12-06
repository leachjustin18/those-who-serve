"use client";

import { useState, useCallback, useEffect, type MouseEvent } from "react";
import { usePathname } from "next/navigation";

import {
    Snackbar,
    Alert,
    AlertTitle,
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Avatar,
    Box,
    Tooltip,
    Menu,
    MenuItem,
    Stack,
    Button,
    Paper,
    BottomNavigation as MuiBottomNavigation,
    BottomNavigationAction,
    type SnackbarProps,
    type SnackbarOrigin,
    type SnackbarCloseReason,
    type AlertColor,
    type SxProps,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import {
    CheckCircleOutline as CheckCircleOutlineIcon,
    InfoOutlined as InfoOutlinedIcon,
    WarningAmber as WarningAmberIcon,
    ReportProblemOutlined as ReportProblemOutlinedIcon,
    ArrowBack as ArrowBackIcon,
    People as PeopleIcon,
    Logout as LogoutIcon,
    CalendarMonth as CalendarMonthIcon,
} from "@mui/icons-material";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const severityIcons: Record<AlertColor, React.ReactNode> = {
    success: <CheckCircleOutlineIcon fontSize="inherit" />,
    info: <InfoOutlinedIcon fontSize="inherit" />,
    warning: <WarningAmberIcon fontSize="inherit" />,
    error: <ReportProblemOutlinedIcon fontSize="inherit" />,
};

export type AlertSnackbarProps = {
    open: boolean;
    severity?: AlertColor;
    title?: string;
    message?: React.ReactNode;
    autoHideDuration?: number;
    onClose?: (
        event?: React.SyntheticEvent | Event,
        reason?: SnackbarCloseReason,
    ) => void;
    anchorOrigin?: SnackbarOrigin;
    action?: React.ReactNode;
    variant?: "standard" | "filled" | "outlined";
    snackbarSx?: SxProps<Theme>;
    slotProps?: SnackbarProps["slotProps"];
};

/**
 * AlertSnackbar component displays a snackbar with an alert message.
 * @param {boolean} open - Whether the snackbar is open or not.
 * @param {AlertColor} severity - The severity of the alert message.
 * @param {string} title - The title of the alert message.
 * @param {React.ReactNode} message - The message to display in the alert.
 * @param {number} autoHideDuration - The duration in milliseconds for the snackbar to auto-hide.
 * @param {function} onClose - Callback function to handle closing the snackbar.
 * @param {SnackbarOrigin} anchorOrigin - The origin point for the snackbar.
 * @param {React.ReactNode} action - Additional actions to display in the snackbar.
 * @param {string} variant - The variant of the alert message.
 */
export const AlertSnackbar = ({
    open,
    severity = "info",
    title,
    message,
    autoHideDuration = 4000,
    onClose,
    anchorOrigin = { vertical: "top", horizontal: "right" },
    action,
    variant = "filled",
    slotProps,
}: AlertSnackbarProps) => {
    return (
        <Snackbar
            open={open}
            autoHideDuration={autoHideDuration}
            onClose={onClose}
            anchorOrigin={anchorOrigin}
            slotProps={slotProps}
        >
            <Alert
                severity={severity}
                variant={variant}
                icon={severityIcons[severity]}
                action={action}
                sx={{ minWidth: { xs: 280, sm: 360 } }}
            >
                {title && <AlertTitle>{title}</AlertTitle>}
                {message}
            </Alert>
        </Snackbar>
    );
};


type AppHeaderProps = {
    userName?: string | null;
    userImage?: string | null;
};

/**
 * App-wide header containing the mission branding and authenticated user controls.
 * @param {string|null} [userName] - User name to render inside the menu greeting.
 * @param {string|null} [userImage] - Avatar source for the signed-in user.
 * @returns {JSX.Element} Fixed AppBar with account avatar and logout menu.
 */
export const AppHeader = ({ userName, userImage }: AppHeaderProps) => {
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

    const hasDisplayName = Boolean(userName?.trim().length);
    const displayName = hasDisplayName ? userName : "Member";
    const avatarSrc = userImage ?? undefined;

    const handleOpenUserMenu = (event: MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleLogout = async () => {
        handleCloseUserMenu();
        await signOut({ callbackUrl: "/login" });
    };

    return (
        <AppBar
            position="fixed"
            sx={(theme) => ({
                left: 0,
                right: 0,
                top: 0,
                px: { xs: 2, md: 4 },
                backgroundColor: alpha(theme.palette.background.paper, 0.95),
                color: theme.palette.text.primary,
                borderBottomLeftRadius: 28,
                borderBottomRightRadius: 28,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                borderTop: "none",
                boxShadow: "0 20px 45px rgba(15,28,46,0.15)",
                backdropFilter: "blur(14px)",
            })}
        >
            <Toolbar
                sx={{
                    justifyContent: "space-between",
                    gap: 2,
                    minHeight: { xs: 72, md: 80 },
                    px: 0,
                }}
            >
                <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                        sx={(theme) => ({
                            width: 48,
                            height: 48,
                            borderRadius: "50%",
                            display: "grid",
                            placeItems: "center",
                            background: alpha(theme.palette.primary.main, 0.12),
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
                            overflow: "hidden",
                        })}
                    >
                        <Avatar
                            src="/logo.png"
                            alt="Those Who Serve"
                            sx={{
                                width: 44,
                                height: 44,
                                backgroundColor: "transparent",
                            }}
                        />
                    </Box>
                    <Box>
                        <Typography variant="h6" noWrap>
                            Those Who Serve - 39th St Church of Christ
                        </Typography>
                    </Box>
                </Stack>

                <Stack direction="row" spacing={2} alignItems="center">
                    <Tooltip title="Open menu">
                        <IconButton
                            onClick={handleOpenUserMenu}
                            sx={(theme) => ({
                                p: 0,
                                color: theme.palette.text.primary,
                                border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                            })}
                        >
                            <Avatar
                                src={avatarSrc}
                                sx={(theme) => ({
                                    width: 44,
                                    height: 44,
                                    border: `2px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                                })}
                            />
                        </IconButton>
                    </Tooltip>
                    <Menu
                        anchorEl={anchorElUser}
                        anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "right",
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: "top",
                            horizontal: "right",
                        }}
                        open={Boolean(anchorElUser)}
                        onClose={handleCloseUserMenu}
                    >
                        <MenuItem disabled>
                            <Typography textAlign="center"> Hello, {displayName}</Typography>
                        </MenuItem>
                        <MenuItem onClick={handleLogout}>
                            <Typography textAlign="center">Log out</Typography>
                        </MenuItem>
                    </Menu>
                </Stack>
            </Toolbar>
        </AppBar>
    );
};

export const BottomNavigation = () => {
    const router = useRouter();
    const pathname = usePathname();

    // Derive navigation value from current pathname
    const getNavigationValue = useCallback(
        (path?: string | null) => {
            if (path?.includes("/calendar")) {
                return 1;
            } else if (path?.includes("/manage-men")) {
                return 0;
            }
            return 0;
        },
        [],
    );

    const [navigationValue, setNavigationValue] = useState(() =>
        getNavigationValue(pathname),
    );

    useEffect(() => {
        setNavigationValue(getNavigationValue(pathname));
    }, [getNavigationValue, pathname]);

    const handleNavigation = (newValue: number) => {
        setNavigationValue(newValue);
        switch (newValue) {
            case 0:
                router.push("/manage-men");
                break;
            case 1:
                router.push("/calendar");
                break;
            case 2:
                void handleLogout();
                break;
        }
    };

    const handleLogout = async () => {
        await signOut({ redirect: true, callbackUrl: "/login" });
    };

    return (
        <Paper
            sx={(theme) => ({
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0,
                px: 2,
                pb: 1.5,
                pt: 0.5,
                backgroundColor: alpha(theme.palette.background.paper, 0.95),
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                borderBottomRightRadius: 0,
                borderBottomLeftRadius: 0,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                borderBottom: "none",
                boxShadow: "0 -15px 40px rgba(15,28,46,0.12)",
                backdropFilter: "blur(18px)",
            })}
            elevation={6}
        >
            <MuiBottomNavigation
                showLabels
                value={navigationValue}
                onChange={(_, newValue) => {
                    handleNavigation(newValue);
                }}
                sx={(theme) => ({
                    backgroundColor: "transparent",
                    "& .MuiBottomNavigationAction-root": {
                        color: theme.palette.text.secondary,
                        fontWeight: 500,
                        borderRadius: 999,
                        px: 2,
                        transition: theme.transitions.create(["color", "background-color"]),
                        "& .MuiSvgIcon-root": {
                            fontSize: 24,
                        },
                    },
                    "& .MuiBottomNavigationAction-root .MuiBottomNavigationAction-label":
                    {
                        fontSize: 14,
                        fontWeight: 600,
                        lineHeight: 1.2,
                        transition: theme.transitions.create("opacity"),
                    },
                    "& .MuiBottomNavigationAction-root.Mui-selected": {
                        color: theme.palette.primary.main,
                        backgroundColor: alpha(theme.palette.primary.main, 0.12),
                        boxShadow: `0 8px 18px ${alpha(theme.palette.primary.main, 0.22)}`,
                    },
                    "& .MuiBottomNavigationAction-root.Mui-selected .MuiBottomNavigationAction-label":
                    {
                        fontSize: 15,
                        opacity: 1,
                    },
                })}
            >
                <BottomNavigationAction label="Men" icon={<PeopleIcon />} />
                <BottomNavigationAction label="Calendar" icon={<CalendarMonthIcon />} />
                <BottomNavigationAction label="Logout" icon={<LogoutIcon />} />
            </MuiBottomNavigation>
        </Paper>
    );
};

/**
 * Button component used for returning to the Manage Men list view.
 * @param {string} [title="Back to Manage Men"] - Text displayed next to the back icon.
 * @returns {JSX.Element} Primary button with routing handler for the manage-men page.
 */
export const BackToManageMen = ({ title = "Back to Manage Men", ...props }) => {
    const router = useRouter();
    return (
        <Button
            startIcon={<ArrowBackIcon />}
            variant="contained"
            color="primary"
            sx={{
                alignSelf: { xs: "stretch", sm: "flex-start" },
                fontWeight: 600,
                px: 2,
            }}
            onClick={() => router.push("/manage-men")}
            {...props}
        >
            {title}
        </Button>
    )
}

/**
 * Renders either a user's profile photo or their derived initials inside an Avatar.
 * @param {string} name - Full name used for alt text and for computing initials.
 * @param {string} [photo] - Optional photo URL; when omitted initials are shown.
 * @returns {JSX.Element} Avatar component sized for the UI header/list items.
 */
export const ManAvatar = ({
    name,
    photo,
}: {
    name: string;
    photo?: string;
}) => {
    let initials;

    if (!photo) {
        initials = name
            .split(" ")
            .map((word) => word[0])
            .join("");
    }

    return (
        <Avatar
            alt={name}
            src={photo ?? undefined}
            sx={(theme) => ({
                width: 44,
                height: 44,
                border: `2px solid ${alpha(theme.palette.primary.main, 0.15)}`,
            })}
        >
            {initials}
        </Avatar>
    );
};

/**
 * Typography wrapper for section headers that can optionally display an icon.
 * @param {React.ReactNode} children - Section title content.
 * @param {React.ReactNode} [icon] - Optional icon rendered before the children.
 * @returns {JSX.Element} Styled `Typography` heading with consistent spacing.
 */
export const SectionTitle = ({
    children,
    icon,
    ...props
}: {
    children: React.ReactNode;
    icon?: React.ReactNode;
}) => {
    return (
        <Typography
            variant="h5"
            sx={{
                fontWeight: 200,
                display: "flex",
                alignItems: "center",
            }}
            gutterBottom
            {...props}
        >
            {icon && <Box sx={{ mr: 1, display: "flex" }}>{icon}</Box>}
            {children}
        </Typography>
    );
};
