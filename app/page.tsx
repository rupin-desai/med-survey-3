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
import { FileText, Loader2 } from "lucide-react";

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
                <Label htmlFor="city">Select your City</Label>
                <Select value={city} onValueChange={handleCityChange}>
                  <SelectTrigger className="w-full h-10">
                    <SelectValue placeholder="— Choose a city —" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Doctor Name Selection - Using native input with datalist for search */}
              <div className="space-y-2">
                <Label htmlFor="doctor-input">Select your Name</Label>
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
                  className="h-10"
                />
                <datalist id="doctor-options">
                  {filteredDoctors.map((d) => (
                    <option key={d.uin} value={d.name} />
                  ))}
                </datalist>
              </div>

              {/* UIN - Auto-populated */}
              <div className="space-y-2">
                <Label htmlFor="uin">Doctor UIN (Auto-filled)</Label>
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
                <Label className="text-base font-medium">
                  Will you be interested in knowing more about Semaglutide to use it for your patients?
                </Label>
                <RadioGroup
                  value={interested}
                  onValueChange={setInterested}
                  className="flex flex-wrap gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Yes" id="interested-yes" />
                    <Label htmlFor="interested-yes" className="cursor-pointer font-normal">
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="No" id="interested-no" />
                    <Label htmlFor="interested-no" className="cursor-pointer font-normal">
                      No
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <hr className="border-border" />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!isFormValid || submitting}
              className="w-full h-12 text-base font-semibold"
              size="lg"
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
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
