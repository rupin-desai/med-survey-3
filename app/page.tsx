"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import doctorData from "@/data/doctors.json";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Loader2, MapPin, User, Hash, CircleHelp, ThumbsUp, ThumbsDown } from "lucide-react";

type DoctorMap = Record<string, { name: string; uin: string }[]>;
const doctors: DoctorMap = doctorData as DoctorMap;

export default function SurveyPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // Doctor selection
  const [city, setCity] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [uin, setUin] = useState("");

  // Survey answer
  const [interested, setInterested] = useState("");

  const cities = useMemo(() => Object.keys(doctors).sort(), []);

  const filteredDoctors = useMemo(() => {
    if (!city) return [];
    return doctors[city] || [];
  }, [city]);

  function handleCityChange(value: string) {
    setCity(value);
    setDoctorName("");
    setUin("");
  }

  function handleDoctorInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value;
    setDoctorName(name);
    const doc = filteredDoctors.find((d) => d.name === name);
    setUin(doc?.uin || "");
  }

  async function handleSubmit(e?: React.FormEvent, isUpdateForm = false) {
    if (e) e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        city,
        doctorName,
        uin,
        interestedInSemaglutide: interested,
        submittedAt: new Date().toISOString(),
        isUpdate: isUpdateForm
      };

      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        router.push("/thank-you");
      } else if (result.duplicate) {
        const confirmUpdate = window.confirm(
          "This doctor (UIN) has already submitted a response. Do you want to update it with your new answers?"
        );
        if (confirmUpdate) {
          await handleSubmit(undefined, true);
        } else {
          setSubmitting(false);
        }
      } else {
        alert(result.message || "Submission failed. Please try again.");
        setSubmitting(false);
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Network error. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  const isFormValid = !!(city && doctorName && uin && interested);

  return (
    <div className="flex min-h-screen items-start justify-center px-4 py-8 sm:py-12">
      <Card className="w-full max-w-2xl animate-fade-in-up shadow-xl border-0">
        {/* Header */}
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent">
            <FileText className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold sm:text-3xl">
            Semaglutide Interest Survey
          </CardTitle>
          <CardDescription className="mt-2">
            Please provide your information and response below
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Doctor Information */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  1
                </span>
                Doctor Information
              </div>

              {/* City Selection */}
              <div className="space-y-2">
                <Label htmlFor="city" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Select your City
                </Label>
                <Select value={city} onValueChange={handleCityChange}>
                  <SelectTrigger className="w-full h-10 cursor-pointer hover:border-primary/50 transition-colors">
                    <SelectValue placeholder="— Choose a city —" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((c) => (
                      <SelectItem key={c} value={c} className="cursor-pointer">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Doctor Name Selection - Using native input with datalist for search */}
              <div className="space-y-2">
                <Label htmlFor="doctor-input" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Select your Name
                </Label>
                <Input
                  id="doctor-input"
                  type="text"
                  list="doctor-options"
                  value={doctorName}
                  onChange={handleDoctorInputChange}
                  required
                  disabled={!city}
                  placeholder={
                    city
                      ? `Type to search (${filteredDoctors.length} doctors)...`
                      : "Select a city first"
                  }
                  className="h-10 cursor-text hover:border-primary/50 transition-colors focus:cursor-text"
                />
                <datalist id="doctor-options">
                  {filteredDoctors.map((d) => (
                    <option key={d.uin} value={d.name} />
                  ))}
                </datalist>
              </div>

              {/* UIN - Auto-populated */}
              <div className="space-y-2">
                <Label htmlFor="uin" className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  Doctor UIN (Auto-filled)
                </Label>
                <Input
                  id="uin"
                  type="text"
                  value={uin}
                  readOnly
                  placeholder="Auto-populated when doctor is selected"
                  className="h-10 bg-muted cursor-not-allowed"
                />
              </div>
            </div>

            <hr className="border-border" />

            {/* Section 2: Survey Question */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  2
                </span>
                Survey Question
              </div>

              <div className="space-y-4">
                <Label className="text-base font-medium flex items-start gap-2">
                  <CircleHelp className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  Will you be interested in knowing more about Semaglutide to use it for your patients?
                </Label>
                <RadioGroup
                  value={interested}
                  onValueChange={setInterested}
                  className="flex flex-wrap gap-4 pt-2"
                >
                  <label
                    htmlFor="interested-yes"
                    className={`flex items-center gap-3 px-5 py-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:border-primary/50 hover:bg-accent/50 ${
                      interested === "Yes"
                        ? "border-primary bg-accent text-primary"
                        : "border-border bg-background"
                    }`}
                  >
                    <RadioGroupItem value="Yes" id="interested-yes" className="cursor-pointer" />
                    <ThumbsUp className={`h-4 w-4 ${interested === "Yes" ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="font-medium">Yes</span>
                  </label>
                  <label
                    htmlFor="interested-no"
                    className={`flex items-center gap-3 px-5 py-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:border-primary/50 hover:bg-accent/50 ${
                      interested === "No"
                        ? "border-primary bg-accent text-primary"
                        : "border-border bg-background"
                    }`}
                  >
                    <RadioGroupItem value="No" id="interested-no" className="cursor-pointer" />
                    <ThumbsDown className={`h-4 w-4 ${interested === "No" ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="font-medium">No</span>
                  </label>
                </RadioGroup>
              </div>
            </div>

            <hr className="border-border" />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!isFormValid || submitting}
              className="w-full h-12 text-base font-semibold cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:cursor-not-allowed disabled:hover:scale-100"
              size="lg"
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Submitting…
                </span>
              ) : (
                "Submit Survey"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
