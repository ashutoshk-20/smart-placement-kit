"use client";
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod"
import { onboardingSchema } from '@/app/lib/schema';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import useFetch from '@/app/lib/use-fetch';
import { updateUser } from '@/actions/user';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const OnboardingForm = ({ industries }) => {
  const [selectedIndustry, setSelectedIndustry] = useState(null);

  const router = useRouter();
  const {loading: updateLoading, fn: updateUserFn, data: updateResult} = useFetch(updateUser);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(onboardingSchema),
  });

  const onSubmit = async (values) =>{
    
    try {
      const formattedIndustry = `${values.industry}-${values.subIndustry.toLowerCase().replace(/ /g, "-")}`;

      await updateUserFn({
        ...values,
        industry: formattedIndustry,
      })
    } catch (error) {
      console.error("Onboarding error: ",error);
      
    }
  };

  useEffect(()=>{
    if(updateResult?.success && !updateLoading){
      toast.success("Profile Completed successfully!");
      router.push("/dashboard");
      router.refresh();
    }

  },[updateResult, updateLoading])

  const watchIndustry = watch("industry");

  return (
    <div className='flex items-center justify-center bg-background'>
      <Card className="w-full max-w-lg mt-10 mx-2">
        <CardHeader className={""}>
          <CardTitle className={"gradient-title text-4xl "}>Complete Your Profile</CardTitle>
          <CardDescription>Select your industry to get personalized career insights and
            recommendations.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action="" className='space-y-6' onSubmit={handleSubmit(onSubmit)}>
            <div className='space-y-2'>
              <Label htmlFor="industry">Industry</Label>
              <Select
                onValueChange={(value) => {
                  setValue("industry", value);
                  setSelectedIndustry(
                    industries.find((ind) => ind.id === value)
                  );
                  setValue("subIndustry", "")
                }}
              >
                <SelectTrigger id="industry" >
                  <SelectValue placeholder="Select an Industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((ind) => {
                    return (
                      <SelectItem value={ind.id} key={ind.id}>{ind.name}</SelectItem>
                    )
                  })}

                </SelectContent>
              </Select>
              {errors.industry && (
                <p className='text-sm text-red-500'>{errors.industry.message}</p>
              )}
            </div>

            { watchIndustry &&
              <div className='space-y-2'>
                <Label htmlFor="subIndustry">Specialization</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("subIndustry", value)
                  }
                >
                  <SelectTrigger id="subIndustry" >
                    <SelectValue placeholder="Select an Specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedIndustry?.subIndustries.map((subInd) => {
                      return (
                        <SelectItem value={subInd} key={subInd}>{subInd}</SelectItem>
                      )
                    })}

                  </SelectContent>
                </Select>
                {errors.subIndustry && (
                  <p className='text-sm text-red-500'>{errors.subIndustry.message}</p>
                )}
              </div>
            }

            <div className='space-y-2'>
                <Label htmlFor="experience">Years of Expreience</Label>
                <Input
                  id= "experience"
                  type="number"
                  min="0"
                  max="50"
                  placeholder="Enter years of experience"
                  {...register("experience")}
                />
                {errors.experience && (
                  <p className='text-sm text-red-500'>{errors.experience.message}</p>
                )}
              </div>

            <div className='space-y-2'>
                <Label htmlFor="skills">Skills</Label>
                <Input
                  id= "skills"
                  placeholder="Python, JavaScript, Project Management, etc."
                  {...register("skills")}
                />

                <p className='text-sm text-muted-foreground'>Seperate multiple skills with commas</p>
                {errors.skills && (
                  <p className='text-sm text-red-500'>{errors.skills.message}</p>
                )}
            </div>


            <div className='space-y-2'>
                <Label htmlFor="bio">Professional Bio</Label>
                <Input
                  id= "bio"
                  placeholder="Tell us about your professional background..."
                  className={"h-32"}
                  {...register("bio")}
                />
                {errors.bio && (
                  <p className='text-sm text-red-500'>{errors.bio.message}</p>
                )}
            </div>

            <Button type="submit" className="w-full" disabled={updateLoading}>
              {
                updateLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin'/>
                    Saving...
                  </>
                ):("Complete Profile")
              }
            </Button>


          </form>
        </CardContent>

      </Card>
    </div>
  )
}

export default OnboardingForm