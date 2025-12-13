"use client";

import { User, Settings, Bell, Moon, ChevronRight, Trash2, Download, MapPin, Thermometer, HelpCircle, Info, Edit2, Check, X, LogOut, Mail, LogIn } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import Link from "next/link";
import { useInventory, useHuntLogs } from "@/lib/storage";
import { useAuth } from "@/lib/auth";
import { useUserProfile } from "@/lib/useUserProfile";

export default function ProfilePage() {
    const { theme, setTheme } = useTheme();
    const { profile, updateProfile, loading: profileLoading, initialized } = useUserProfile();
    const { inventory, clearInventory } = useInventory();
    const { logs, clearLogs } = useHuntLogs();
    const { user, signOut } = useAuth();

    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState("");
    const [isEditingLocation, setIsEditingLocation] = useState(false);
    const [tempLocation, setTempLocation] = useState("");

    // Check if we're on the client
    const mounted = typeof window !== "undefined";

    const handleExportData = () => {
        const data = {
            exportDate: new Date().toISOString(),
            appVersion: "1.0.0",
            preferences: profile,
            inventory,
            huntLogs: logs,
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `huntmanifest-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleClearAllData = () => {
        if (confirm("⚠️ This will permanently delete ALL your data including inventory and hunt logs. This cannot be undone. Are you sure?")) {
            if (confirm("Final confirmation: Delete everything?")) {
                clearInventory();
                clearLogs();
                localStorage.removeItem("timber_user_profile");
                window.location.reload();
            }
        }
    };

    const handleSignOut = async () => {
        if (confirm("Are you sure you want to sign out?")) {
            await signOut();
            // No reload needed cleanup happens via auth state change
        }
    };

    if (!mounted || !initialized) return null;

    return (
        <div className="pb-8 animate-fade-in">
            {/* Header */}
            <header className="mb-6 text-center">
                <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-mallard-green to-mallard-green-light flex items-center justify-center shadow-lg mb-4">
                    <User className="h-12 w-12 text-white" />
                </div>

                {/* Editable Name */}
                {isEditingName ? (
                    <div className="flex items-center justify-center gap-2">
                        <input
                            type="text"
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            className="text-2xl font-bold text-center bg-transparent border-b-2 border-primary focus:outline-none w-40"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    updateProfile({ hunterName: tempName || "Hunter" });
                                    setIsEditingName(false);
                                }
                                if (e.key === 'Escape') {
                                    setIsEditingName(false);
                                }
                            }}
                        />
                        <button
                            onClick={() => {
                                updateProfile({ hunterName: tempName || "Hunter" });
                                setIsEditingName(false);
                            }}
                            className="p-1 text-green-600 hover:bg-green-100 rounded"
                        >
                            <Check className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setIsEditingName(false)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => {
                            setTempName(profile.hunterName);
                            setIsEditingName(true);
                        }}
                        className="group flex items-center justify-center gap-2 mx-auto"
                    >
                        <h1 className="text-2xl font-bold">{profile.hunterName}</h1>
                        <Edit2 className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                )}
                <p className="text-sm text-muted-foreground">2025 Season Active</p>
            </header>

            {/* Stats Bar */}
            <div className="flex justify-center gap-6 mb-6 p-4 bg-card rounded-xl border border-border">
                <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{inventory.length}</p>
                    <p className="text-xs text-muted-foreground">Gear Items</p>
                </div>
                <div className="w-px bg-border" />
                <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{logs.length}</p>
                    <p className="text-xs text-muted-foreground">Hunts Recorded</p>
                </div>
                <div className="w-px bg-border" />
                <div className="text-center">
                    <p className="text-2xl font-bold text-mallard-yellow">
                        {logs.reduce((acc, log) => acc + log.harvests.reduce((sum, h) => sum + h.count, 0), 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">Total Harvest</p>
                </div>
            </div>

            {/* Account CTA (Signed Out State) */}
            {!user && (
                <div className="mb-6 p-1 rounded-2xl bg-gradient-to-r from-mallard-green to-mallard-green-light shadow-lg">
                    <div className="bg-card rounded-xl p-4 text-center">
                        <h3 className="font-bold text-lg mb-1">Backup Your Data</h3>
                        <p className="text-sm text-muted-foreground mb-4">Sign in to sync your gear and hunts to the cloud.</p>
                        <Link href="/login" className="block w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                            <LogIn className="h-5 w-5" />
                            Sign In / Create Account
                        </Link>
                    </div>
                </div>
            )}

            {/* Settings Sections */}
            <div className="space-y-6">
                {/* Preferences Section */}
                <section>
                    <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Preferences
                    </h2>
                    <div className="space-y-2">
                        {/* Home Location */}
                        <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-secondary rounded-lg">
                                    <MapPin className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <span className="font-medium">Home Location</span>
                                    <p className="text-xs text-muted-foreground">For weather conditions</p>
                                </div>
                            </div>
                            {isEditingLocation ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={tempLocation}
                                        onChange={(e) => setTempLocation(e.target.value)}
                                        placeholder="City, State"
                                        className="text-sm bg-secondary px-2 py-1 rounded border-none focus:outline-none focus:ring-1 focus:ring-primary w-32"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                updateProfile({ homeLocation: tempLocation });
                                                setIsEditingLocation(false);
                                            }
                                            if (e.key === 'Escape') setIsEditingLocation(false);
                                        }}
                                    />
                                    <button onClick={() => {
                                        updateProfile({ homeLocation: tempLocation });
                                        setIsEditingLocation(false);
                                    }} className="text-green-600"><Check className="h-4 w-4" /></button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => {
                                        setTempLocation(profile.homeLocation);
                                        setIsEditingLocation(true);
                                    }}
                                    className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                                >
                                    {profile.homeLocation || "Set location"}
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        {/* Temperature Unit */}
                        <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-secondary rounded-lg">
                                    <Thermometer className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <span className="font-medium">Temperature Unit</span>
                            </div>
                            <div className="flex bg-secondary rounded-lg p-0.5">
                                <button
                                    onClick={() => updateProfile({ temperatureUnit: 'F' })}
                                    className={`px-3 py-1 text-sm rounded-md transition-colors ${profile.temperatureUnit === 'F' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                                >
                                    °F
                                </button>
                                <button
                                    onClick={() => updateProfile({ temperatureUnit: 'C' })}
                                    className={`px-3 py-1 text-sm rounded-md transition-colors ${profile.temperatureUnit === 'C' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                                >
                                    °C
                                </button>
                            </div>
                        </div>

                        {/* Notifications */}
                        <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-secondary rounded-lg">
                                    <Bell className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <span className="font-medium">Notifications</span>
                            </div>
                            <button
                                onClick={() => updateProfile({ notificationsEnabled: !profile.notificationsEnabled })}
                                className={`relative w-12 h-7 rounded-full transition-colors ${profile.notificationsEnabled ? "bg-primary" : "bg-secondary"}`}
                            >
                                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${profile.notificationsEnabled ? "translate-x-6" : "translate-x-1"}`} />
                            </button>
                        </div>

                        {/* Dark Mode */}
                        <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-secondary rounded-lg">
                                    <Moon className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <span className="font-medium">Dark Mode</span>
                            </div>
                            <button
                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                className={`relative w-12 h-7 rounded-full transition-colors ${theme === "dark" ? "bg-primary" : "bg-secondary"}`}
                            >
                                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${theme === "dark" ? "translate-x-6" : "translate-x-1"}`} />
                            </button>
                        </div>
                    </div>
                </section>

                {/* Data Management Section */}
                <section>
                    <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Data Management
                    </h2>
                    <div className="space-y-2">
                        <button
                            onClick={handleExportData}
                            className="w-full flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:bg-secondary/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-secondary rounded-lg">
                                    <Download className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="text-left">
                                    <span className="font-medium">Export Data</span>
                                    <p className="text-xs text-muted-foreground">Download all your data as JSON</p>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </button>

                        <button
                            onClick={handleClearAllData}
                            className="w-full flex items-center justify-between p-4 bg-card rounded-xl border border-destructive/30 hover:bg-destructive/10 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-destructive/10 rounded-lg">
                                    <Trash2 className="h-5 w-5 text-destructive" />
                                </div>
                                <div className="text-left">
                                    <span className="font-medium text-destructive">Clear All Data</span>
                                    <p className="text-xs text-muted-foreground">Remove all inventory and logs</p>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-destructive" />
                        </button>
                    </div>
                </section>

                {/* About Section */}
                <section>
                    <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        About
                    </h2>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-secondary rounded-lg">
                                    <HelpCircle className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <span className="font-medium">Help & Support</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </div>
                </section>

                {/* Account Section */}
                {user && (
                    <section>
                        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Account
                        </h2>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-secondary rounded-lg">
                                        <Mail className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <span className="font-medium">Email</span>
                                        <p className="text-xs text-muted-foreground">{user.email}</p>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:bg-secondary/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-secondary rounded-lg">
                                        <LogOut className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <span className="font-medium">Sign Out</span>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </button>
                        </div>
                    </section>
                )}
            </div>

            {/* Footer */}
            <div className="mt-8 text-center space-y-1">
                <p className="text-sm font-semibold bg-gradient-to-r from-mallard-green to-mallard-green-light dark:from-mallard-yellow dark:to-mallard-yellow-light bg-clip-text text-transparent">
                    HuntManifest
                </p>
                <p className="text-xs text-muted-foreground">
                    Waterfowl Logistics Manager
                </p>
                <p className="text-xs text-muted-foreground">
                    Created by Talkin&apos; Timber • v1.0.0
                </p>
            </div>
        </div>
    );
}
