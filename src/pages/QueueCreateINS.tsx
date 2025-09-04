import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Phone,
  CreditCard,
  UserPlus,
  CheckCircle,
  Printer,
  Volume2,
  VolumeX,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { QueueIns } from "@/integrations/supabase/schema";
import { toast } from "sonner";
import { printQueueTicketINS } from "@/components/queue/ins/PrintQueueTicketINS";
import QueuePageHeader from "@/components/queue/QueuePageHeader";
import QueueBoardAlgorithmInfo from "@/components/queue/board/QueueBoardAlgorithmInfo";
import HospitalFooter from "@/components/queue/HospitalFooter";
import { formatQueueInsNumber } from "@/utils/queueInsFormatters";

const QueueCreateINS = () => {
  const [formData, setFormData] = useState({
    phoneNumber: "",
    idCard: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [queueNumber, setQueueNumber] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [waitTiemQueueNext, setWaitTiemQueueNext] = useState<number>(0);

  // Update the current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Load sound setting from localStorage on component mount
  useEffect(() => {
    const savedSoundEnabled = localStorage.getItem("queue_voice_enabled");
    if (savedSoundEnabled !== null) {
      setSoundEnabled(savedSoundEnabled === "true");
    }
  }, []);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // ตรวจสอบเลขบัตรประชาชน (บังคับ)
    if (!formData.idCard.trim()) {
      newErrors.idCard = "กรุณากรอกเลขบัตรประชาชน";
    } else {
      // ลบเครื่องหมาย - และช่องว่างออกก่อนตรวจสอบ
      const idCardDigitsOnly = formData.idCard.replace(/[\s-]/g, "");
      if (!/^\d{13}$/.test(idCardDigitsOnly)) {
        newErrors.idCard = "เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก";
      }
    }

    // ตรวจสอบเบอร์โทร (ไม่บังคับ แต่ถ้ากรอกต้องถูกต้อง)
    if (formData.phoneNumber.trim()) {
      // ลบเครื่องหมาย - และช่องว่างออกก่อนตรวจสอบ
      const phoneDigitsOnly = formData.phoneNumber.replace(/[\s-]/g, "");
      if (!/^0\d{9}$/.test(phoneDigitsOnly)) {
        newErrors.phoneNumber = "เบอร์โทรต้องเป็นตัวเลข 10 หลัก เริ่มต้นด้วย 0";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatIdCard = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 13) {
      return numbers.replace(
        /(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})/,
        "$1-$2-$3-$4-$5"
      );
    }
    return value;
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
    }
    return value;
  };

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;

    if (field === "idCard") {
      formattedValue = formatIdCard(value);
    } else if (field === "phoneNumber") {
      formattedValue = formatPhoneNumber(value);
    }

    setFormData((prev) => ({
      ...prev,
      [field]: formattedValue,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const generateQueueNumber = async () => {
    try {
      // ดึงหมายเลขคิวล่าสุดของวันนี้
      const today = new Date().toISOString().split("T")[0];
      const { data: lastQueue } = await supabase
        .from("queues_ins")
        .select("number")
        .eq("queue_date", today)
        .order("number", { ascending: false })
        .limit(1);

      const nextNumber =
        lastQueue && lastQueue.length > 0 ? lastQueue[0].number + 1 : 1;
      return nextNumber;
    } catch (error) {
      console.error("Error generating queue number:", error);
      return 1;
    }
  };

  async function calculateWaitTimeQueueNext() {
    try {
      // ดึงข้อมูลคิวที่มีสถานะ WAITING
      const today = new Date().toISOString().split("T")[0];
      const { data: waitingQueues, error } = await supabase
        .from("queues_ins")
        .select("*")
        .eq("queue_date", today)
        .eq("status", "WAITING")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching waiting queues:", error);
        return 0;
      }

      // คำนวณเวลารอโดยคิดเพิ่ม 10 นาทีต่อคิว
      const waitTimePerQueue = 10;
      const calculatedTime = waitingQueues.length * waitTimePerQueue;

      setWaitTiemQueueNext(calculatedTime);
      return calculatedTime;
    } catch (error) {
      console.error("Error calculating wait time:", error);
      return 0;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const queueNum = await generateQueueNumber();
      const today = new Date().toISOString().split("T")[0];

      // Fetch the first service point from service_points_ins table
      const { data: servicePoints, error: servicePointError } = await supabase
        .from("service_points_ins")
        .select("id")
        .eq("enabled", true)
        .order("created_at", { ascending: true })
        .limit(1);

      if (servicePointError) {
        throw servicePointError;
      }

      if (!servicePoints || servicePoints.length === 0) {
        throw new Error("No service points found");
      }

      const servicePointId = servicePoints[0].id;

      const queueData: Partial<QueueIns> = {
        number: queueNum,
        type: "CHECK",
        status: "WAITING",
        queue_date: today,
        phone_number: formData.phoneNumber.replace(/\D/g, "") || null,
        ID_card: formData.idCard.replace(/\D/g, ""),
        service_point_id: servicePointId,
      };

      const { error } = await supabase.from("queues_ins").insert([queueData]);

      if (error) {
        throw error;
      }

      setQueueNumber(queueNum);
      setIsSuccess(true);
      toast.success(`สร้างคิวสำเร็จ! หมายเลขคิวของคุณคือ ${queueNum}`);
    } catch (error) {
      console.error("Error creating queue:", error);
      toast.error("เกิดข้อผิดพลาดในการสร้างคิว กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAnother = () => {
    setIsSuccess(false);
    setQueueNumber(null);
    setFormData({
      phoneNumber: "",
      idCard: "",
    });
    setErrors({});
  };

  const handlePrint = async () => {
    if (!queueNumber) return;

    try {
      // คำนวณเวลารอคิว
      const waitTime = await calculateWaitTimeQueueNext();

      printQueueTicketINS({
        queueNumber,
        phoneNumber: formData.phoneNumber.replace(/\D/g, "") || "",
        purpose: "ตรวจทั่วไป",
        estimatedWaitTime: 15,
        queueType: "CHECK",
        waitTiemQueueNext: waitTime,
      });
    } catch (error) {
      console.error("Error printing ticket:", error);
      toast.error("เกิดข้อผิดพลาดในการพิมพ์บัตรคิว", { id: "print-ticket" });
    }
  };

  if (isSuccess && queueNumber) {
    return (
      <div className="flex flex-col min-h-screen bg-pharmacy-50">
        {/* Header */}
        <QueuePageHeader
          currentTime={currentTime}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          title="ระบบลงทะเบียนคิวเข้าตรวจ"
        />

        {/* Main Content Area */}
        <main className="flex-1 p-6 flex items-center justify-center">
          <Card className="w-full max-w-md shadow-2xl border-0">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  สร้างคิวสำเร็จ!
                </h2>
                <p className="text-gray-600">หมายเลขคิวของคุณคือ</p>
              </div>

              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl p-6 mb-6">
                <div className="text-6xl font-bold mb-2">
                  {formatQueueInsNumber("CHECK", queueNumber)}
                </div>
                <div className="text-lg opacity-90">หมายเลขคิว</div>
              </div>

              <div className="space-y-3 mb-6 text-sm text-gray-600">
                <p>กรุณารอการเรียกคิวที่หน้าจอแสดงผล</p>
                <p>หรือติดตามสถานะคิวผ่านระบบ</p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handlePrint}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Printer className="w-5 h-5" />
                  พิมพ์บัตรคิว
                </Button>

                <Button
                  onClick={handleCreateAnother}
                  variant="outline"
                  className="w-full border-2 border-blue-200 text-blue-600 hover:bg-blue-50 font-medium py-3 rounded-xl transition-all duration-200"
                >
                  สร้างคิวใหม่
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>

        {/* Footer */}
        <HospitalFooter />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-pharmacy-50">
      {/* Header */}
      <QueuePageHeader
        currentTime={currentTime}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        title="ระบบลงทะเบียนคิวเข้าตรวจ"
      />

      {/* Algorithm Info Bar */}
      <QueueBoardAlgorithmInfo algorithmName="ลงทะเบียนคิวเข้าตรวจ" />

      {/* Main Content Area */}
      <main className="flex-1 p-6 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              ลงทะเบียนคิวเข้าตรวจ
            </CardTitle>
            <p className="text-gray-600 mt-2">
              กรุณากรอกข้อมูลเพื่อรับหมายเลขคิว
            </p>
          </CardHeader>

          <CardContent className="px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* เลขบัตรประชาชน */}
              <div className="space-y-2">
                <Label
                  htmlFor="idCard"
                  className="text-sm font-medium text-gray-700 flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  เลขบัตรประชาชน <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="idCard"
                  type="text"
                  placeholder="X-XXXX-XXXXX-XX-X"
                  value={formData.idCard}
                  onChange={(e) => handleInputChange("idCard", e.target.value)}
                  className={`h-12 rounded-xl border-2 transition-all duration-200 ${
                    errors.idCard
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 focus:border-blue-500"
                  }`}
                  maxLength={17}
                  required
                />
                {errors.idCard && (
                  <p className="text-red-500 text-sm mt-1">{errors.idCard}</p>
                )}
              </div>

              {/* เบอร์โทร */}
              <div className="space-y-2">
                <Label
                  htmlFor="phoneNumber"
                  className="text-sm font-medium text-gray-700 flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  เบอร์โทรศัพท์ (ไม่บังคับ)
                </Label>
                <Input
                  id="phoneNumber"
                  type="text"
                  placeholder="0XX-XXX-XXXX"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    handleInputChange("phoneNumber", e.target.value)
                  }
                  className={`h-12 rounded-xl border-2 transition-all duration-200 ${
                    errors.phoneNumber
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 focus:border-blue-500"
                  }`}
                  maxLength={12}
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>

              {/* ข้อมูลเพิ่มเติม */}
              <Alert className="border-blue-200 bg-blue-50">
                <AlertDescription className="text-blue-800 text-sm">
                  <strong>หมายเหตุ:</strong>{" "}
                  ข้อมูลที่กรอกจะใช้สำหรับการติดต่อและระบุตัวตนเท่านั้น
                </AlertDescription>
              </Alert>

              {/* ปุ่มสร้างคิว */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    กำลังสร้างคิว...
                  </>
                ) : (
                  "รับหมายเลขคิว"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <HospitalFooter />
    </div>
  );
};

export default QueueCreateINS;
