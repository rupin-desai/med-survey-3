"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
    Lock, 
    User, 
    ArrowLeft, 
    Download, 
    Search, 
    Users, 
    ThumbsUp, 
    ThumbsDown,
    Loader2,
    LogIn,
    LayoutDashboard,
    Trash2
} from "lucide-react";

interface Submission {
    city: string;
    doctorName: string;
    uin: string;
    interestedInSemaglutide: string;
    submittedAt: string;
}

export default function AdminPage() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Login State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");
    const [loginLoading, setLoginLoading] = useState(false);

    // Clear Database State
    const [clearDialogOpen, setClearDialogOpen] = useState(false);
    const [confirmText, setConfirmText] = useState("");
    const [clearLoading, setClearLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoginLoading(true);
        
        // Credentials from user request
        const expectedUser = process.env.NEXT_PUBLIC_ADMIN_USER || "Lupin@admin";
        const expectedPass = process.env.NEXT_PUBLIC_ADMIN_PASS || "semaglutide";

        setTimeout(() => {
            if (username === expectedUser && password === expectedPass) {
                setIsAuthenticated(true);
                setLoginError("");
            } else {
                setLoginError("Invalid username or password");
            }
            setLoginLoading(false);
        }, 500);
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetch("/api/submissions")
                .then((res) => res.json())
                .then((data) => {
                    if (Array.isArray(data)) {
                        setSubmissions(data.sort((a, b) =>
                            new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
                        ));
                    }
                    setLoading(false);
                })
                .catch((err) => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [isAuthenticated]);

    const filtered = submissions.filter((s) =>
        s.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.uin.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const exportToExcel = () => {
        const exportData = submissions.map(s => ({
            "Date": new Date(s.submittedAt).toLocaleDateString(),
            "City": s.city,
            "Doctor Name": s.doctorName,
            "UIN": s.uin,
            "Interested in Semaglutide": s.interestedInSemaglutide,
            "Submitted At": s.submittedAt
        }));
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Submissions");
        XLSX.writeFile(workbook, `semaglutide_survey_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handleClearDatabase = async () => {
        if (confirmText !== "CONFIRM") return;
        
        setClearLoading(true);
        try {
            const response = await fetch("/api/clear", { method: "DELETE" });
            if (response.ok) {
                setSubmissions([]);
                setClearDialogOpen(false);
                setConfirmText("");
            } else {
                console.error("Failed to clear database");
            }
        } catch (error) {
            console.error("Error clearing database:", error);
        } finally {
            setClearLoading(false);
        }
    };

    const stats = {
        total: submissions.length,
        yes: submissions.filter((s) => s.interestedInSemaglutide === "Yes").length,
        no: submissions.filter((s) => s.interestedInSemaglutide === "No").length,
    };

    if (!isAuthenticated) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <Card className="w-full max-w-md animate-fade-in-up shadow-xl border-0">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent">
                            <Lock className="h-7 w-7 text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
                        <CardDescription>
                            Please enter your credentials to continue
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username" className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    Username
                                </Label>
                                <Input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    autoComplete="username"
                                    required
                                    className="h-10 cursor-text"
                                    placeholder="Enter your username"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="flex items-center gap-2">
                                    <Lock className="h-4 w-4 text-muted-foreground" />
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    required
                                    className="h-10 cursor-text"
                                    placeholder="Enter your password"
                                />
                            </div>

                            {loginError && (
                                <p className="text-sm font-medium text-destructive">{loginError}</p>
                            )}

                            <Button
                                type="submit"
                                disabled={loginLoading}
                                className="w-full h-11 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all"
                            >
                                {loginLoading ? (
                                    <span className="inline-flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Logging in...
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-2">
                                        <LogIn className="h-4 w-4" />
                                        Login to Dashboard
                                    </span>
                                )}
                            </Button>

                            <div className="pt-4 text-center">
                                <Link 
                                    href="/" 
                                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to Survey
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading submissions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                            <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
                            <p className="text-muted-foreground text-sm">Manage and view survey responses</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={exportToExcel}
                            variant="outline"
                            className="cursor-pointer hover:bg-accent transition-colors"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Export to Excel
                        </Button>
                        <Link href="/">
                            <Button variant="ghost" className="cursor-pointer">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Survey
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-default">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
                                    <Users className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Responses</p>
                                    <p className="text-3xl font-bold text-foreground">{stats.total}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-default">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success-light">
                                    <ThumbsUp className="h-6 w-6 text-success" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Interested (Yes)</p>
                                    <p className="text-3xl font-bold text-success">{stats.yes}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-default">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                                    <ThumbsDown className="h-6 w-6 text-destructive" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Not Interested (No)</p>
                                    <p className="text-3xl font-bold text-destructive">{stats.no}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search by doctor, city, or UIN..."
                            className="pl-10 h-10 cursor-text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <Card className="border-0 shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground">Date</th>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground">City</th>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground">Doctor Name</th>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground">UIN</th>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground text-center">Interested?</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filtered.length > 0 ? (
                                    filtered.map((s, i) => (
                                        <tr key={i} className="hover:bg-muted/30 transition-colors cursor-default">
                                            <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                                                {new Date(s.submittedAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 font-medium">{s.city}</td>
                                            <td className="px-6 py-4">{s.doctorName}</td>
                                            <td className="px-6 py-4 font-mono text-muted-foreground">{s.uin}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                                                    s.interestedInSemaglutide === 'Yes' 
                                                        ? 'bg-success-light text-success' 
                                                        : 'bg-destructive/10 text-destructive'
                                                }`}>
                                                    {s.interestedInSemaglutide === 'Yes' ? (
                                                        <ThumbsUp className="h-3 w-3" />
                                                    ) : (
                                                        <ThumbsDown className="h-3 w-3" />
                                                    )}
                                                    {s.interestedInSemaglutide}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">
                                            No submissions found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
}
