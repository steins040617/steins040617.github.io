export interface Diagram {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
}

interface ProjectModule {
  id: string;
  title: string;
  english: string;
  description: string;
  points: string[];
  diagram?: Diagram;
}

interface ProjectDetail {
  lead: string;
  overview: string[];
  architectureText: string;
  diagram: Diagram;
  flow: string[];
  moduleIntro: string;
  modules: ProjectModule[];
  highlights: {title: string; description: string}[];
  metrics: {value: string; label: string}[];
  resultNote: string;
}

export const projectDetails: Record<string, ProjectDetail> = {
  "remote-lab": {
    lead: "让程序部署、信号激励、波形分析与实验观察跨越空间限制。以 FPGA 为核心，将分散的实验工具整合为一套可远程操作的数字电路实验系统。",
    overview: [
      "传统数字电路实验往往依赖现场接线、下载器和多台调试仪器。本项目面向远程实验教学，围绕“程序如何部署、输入如何构造、内部逻辑如何观察、实物现象如何确认”四个问题，搭建了一套软硬件协同的 FPGA 实验平台。",
      "系统基于紫光同创盘古 50K 平台，结合主控板、用户板、以太网链路和 PyQt5 上位机，集成远程烧录、逻辑分析、示波采集、双通道 DDS、激励注入及视频回传。配套实验从基础组合逻辑延伸到接口与数字信号处理，为数字电路学习提供完整的实验与调试路径。",
    ],
    architectureText: "整体架构分为 PC 交互端、FPGA 主控端与 FPGA 用户端。主控端组织配置数据、采样数据和图像数据，用户端承载具体实验；PC 端统一下发控制指令并呈现实验结果，形成从程序部署到行为观测的联动。",
    diagram: {src: "/images/diagrams/remote-lab-system.png", alt: "远程实验室系统总框图：PC 端、FPGA 主控板、缓存、以太网与 FPGA 用户板的连接关系", caption: "远程实验室系统总框图 · 原始国赛设计报告", width: 1269, height: 673},
    flow: ["PC 配置与部署", "网络与缓存", "FPGA 实验运行", "采样 / 视频回传"],
    moduleIntro: "将实验平台拆解为七个协同工作的模块，从底层配置链路到上层实验交互逐层展开。",
    modules: [
      {
        id: "configuration", title: "远程下载与程序固化", english: "REMOTE CONFIGURATION",
        description: "将原本依赖本地下载器的程序部署流程延伸到网络端。上位机发送比特流，FPGA 主控端完成缓存、数据整理与 JTAG 时序控制，将实验程序部署到用户板。",
        points: [
          "采用 UDP 与重传机制传输配置文件，接收后写入 DDR3，解耦网络接收与器件配置的速率差异。",
          "通过异步 FIFO 和移位逻辑，将缓存数据转换为 JTAG 配置所需的串行比特流。",
          "利用 Flash 保存比特流并支持分区域固化，使常用实验能够从本地存储重新加载。",
        ],
        diagram: {src: "/images/diagrams/remote-lab-configuration.png", alt: "DDR3 数据缓存、Flash 固化存储与 JTAG 烧录模块的连接框图", caption: "远程下载与固化的数据链路", width: 625, height: 286},
      },
      {
        id: "logic-analyzer", title: "可配置逻辑分析仪", english: "LOGIC ANALYZER",
        description: "将 FPGA 内部信号转化为可观察的时序波形。模块通过配置采样速率、深度与触发条件，捕获目标事件附近的数据，为接口联调和时序逻辑分析提供依据。",
        points: [
          "指令译码后分别配置采样、触发和采集控制模块，支持电平、边沿与立即触发。",
          "有限状态机协调预采样、等待触发、触发后采集和数据读回，保留关键事件前后的波形上下文。",
          "将采集数据送至上位机回显，支持从实验现象进一步追踪到内部信号变化。",
        ],
        diagram: {src: "/images/diagrams/remote-lab-logic.png", alt: "指令译码、采样配置、触发配置和逻辑分析仪控制模块的结构图", caption: "逻辑分析仪的采样与触发控制结构", width: 2364, height: 1248},
      },
      {
        id: "oscilloscope", title: "数字示波器与双缓存采集", english: "OSCILLOSCOPE & BUFFERING",
        description: "围绕信号采样、触发定位、缓存读取和上传显示组织示波器数据通路。设计重点是协调连续产生的采样数据与间歇进行的数据传输。",
        points: [
          "将采样速率、触发条件与采集状态分别管理，并结合频率测量辅助信号分析。",
          "使用状态机控制数据写入、等待触发、触发后采集、读取发送与超时处理。",
          "在报告中的优化方案中引入双缓存乒乓调度，让两个缓冲通道交替执行采样写入和数据上传，减少串行读写造成的等待。",
        ],
        diagram: {src: "/images/diagrams/remote-lab-scope.png", alt: "示波器的频率测量、采样配置、触发配置和整体控制模块框图", caption: "数字示波器的采样与控制结构", width: 2500, height: 1273},
      },
      {
        id: "dds", title: "双通道 DDS 信号发生器", english: "DUAL-CHANNEL DIRECT DIGITAL SYNTHESIS",
        description: "以相位累加器和波形查找表为基础，构建可配置的双通道信号源，为被测电路提供可调节、可重复的实验激励。",
        points: [
          "支持正弦、方波、三角波与锯齿波，配置频率、幅度、相位、偏置等参数。",
          "译码模块向 CH1 与 CH2 分发控制指令，两个通道分别生成信号并可独立观察。",
          "使用乘法器对两路信号逐点混频，将基础波形生成扩展到更丰富的信号实验。",
        ],
        diagram: {src: "/images/diagrams/remote-lab-dds.png", alt: "译码器、CH1 和 CH2 两路 DDS 以及乘法混频模块的逻辑框图", caption: "双通道 DDS 与混频数据通路", width: 2324, height: 1008},
      },
      {
        id: "debug", title: "激励注入与可复现调试", english: "STIMULUS INJECTION & DEBUG",
        description: "在 FPGA 内部建立可控激励路径，把“给电路一个输入，再观察结果”的调试操作搬到远程界面。输入数据被缓存后按既定时序送入实例模块，输出再由逻辑分析仪采集。",
        points: [
          "上位机编辑数字波形并下发激励数据，FPGA 解析后写入 RAM。",
          "控制状态机组织激励接收、缓存完成、读取输出及结束反馈，便于重复运行同一组测试。",
          "将激励构造、实例运行、结果采样和波形回显衔接起来，减少仅凭最终输出判断问题的局限。",
        ],
        diagram: {src: "/images/diagrams/remote-lab-debug.png", alt: "远程调试控制、指令译码、实例实验和逻辑分析仪的连接示意图", caption: "远程激励与调试控制模块", width: 2244, height: 888},
      },
      {
        id: "video", title: "摄像头采集与视频回传", english: "VISION & REMOTE OBSERVATION",
        description: "通过 OV5640 摄像头观察真实板卡的实验现象，使远程实验同时具备内部波形与外部实物两种反馈。",
        points: [
          "配置摄像头寄存器，采集 DVP 数据流并完成图像时序对齐。",
          "通过异步 FIFO 桥接图像采集域与网络传输域，由状态机调度数据包发送。",
          "在上位机展示视频，辅助确认 LED、数码管和其他外设的实际工作状态。",
        ],
      },
      {
        id: "host", title: "统一上位机与阶梯式实验", english: "HOST SOFTWARE & EXPERIMENTS",
        description: "使用 PyQt5 统一组织仪器控制、波形显示、网络配置和实验入口，将底层功能转化为可直接操作的教学工具。",
        points: [
          "围绕示波器、逻辑分析仪、信号发生器与 Debug 分区组织界面，支持参数下发和结果回显。",
          "基础实验覆盖全加器、呼吸灯、分频器、UART 与 HDMI 彩条；高阶实验延伸到频率计、图像显示和 FIR 滤波。",
          "结合实验指导与调试案例，把逻辑描述、器件运行和波形分析连接为逐步深入的实践过程。",
        ],
      },
    ],
    highlights: [
      {title: "从部署到观测的完整实验链路", description: "程序下载、信号激励、逻辑采集和视频观察围绕同一个实验对象协同工作，远程操作能够覆盖实验的多个关键环节。"},
      {title: "以缓存与状态机处理系统协同", description: "通过 DDR3、Flash、RAM 和异步 FIFO 承接不同速率的数据，使用状态机明确配置、采样和传输阶段，重点解决模块组合后的时序与数据流问题。"},
      {title: "把调试能力沉淀为实验基础设施", description: "逻辑分析、示波采集和激励注入可服务于不同的实例实验，新增实验时能够沿用已有的观察与控制路径。"},
    ],
    metrics: [{value: "< 5 s", label: "报告记录的远程下载时间"}, {value: "双通道", label: "DDS 信号生成与混频"}, {value: "软硬协同", label: "部署、运行、采集与回显"}],
    resultNote: "获第九届全国大学生集成电路创新创业大赛全国总决赛二等奖。功能与测试结果依据团队国赛设计报告整理，性能数值对应报告的实验条件。",
  },
  "audio-processor": {
    lead: "在资源受限的国产 FPGA 上贯通音频输入输出、硬件 DSP、动态参数控制与信号可视化，将多种音效算法组织成一套可交互的实时处理系统。",
    overview: [
      "项目以高云 ACG525 开发板为核心，结合 WM8960 音频编解码器和 ES9038Q2M 解码板，构建从音频采集、缓存、数字处理到播放输出的完整链路，支持滤波、回声、混响、均衡与多倍率重采样。",
      "系统同时面向“声音处理”和“处理过程可观察”两个目标：一方面通过 FPGA 逻辑实现多种音效，另一方面通过串口下发参数、以太网传输数据和上位机波形显示，让算法效果能够被听到、调节和验证。",
    ],
    architectureText: "架构围绕音频数据主通路、参数控制通路和观测通路展开。音频经过 I²S 接收和 FIFO 缓存后进入处理模块，再送往输出端；UART 与按键负责模式及参数配置，FFT 与以太网支路用于信号分析和可视化。",
    diagram: {src: "/images/diagrams/audio-system.png", alt: "音频效果处理器系统框图，包含 WM8960、I2S、FIFO、音频处理模块、FFT、UART 和以太网", caption: "音频效果处理系统总框图 · 原始设计文稿", width: 1041, height: 913},
    flow: ["音频采集", "异步缓存", "硬件音效处理", "输出与可视化"],
    moduleIntro: "围绕实时音频链路，将系统分为六组功能模块，分别解决数据接入、算法处理、采样率转换、参数配置与结果观察。",
    modules: [
      {
        id: "audio-io", title: "音频收发与跨时钟域缓存", english: "AUDIO I/O & CLOCK-DOMAIN CROSSING",
        description: "以 I²S 时序完成音频数据接收与发送，通过异步 FIFO 对接音频、系统处理与网络时钟域，建立多模块协同的数据基础。",
        points: [
          "配置 WM8960 寄存器完成音频输入输出初始化，结合 ES9038Q2M 实现相应播放输出。",
          "在采集、播放和以太网支路分别使用 FIFO，缓冲不同接口的数据节奏。",
          "通过空满状态、读写水位和处理状态管理数据请求，避免仅靠模块直连造成的数据覆盖或读取失配。",
        ],
        diagram: {src: "/images/diagrams/audio-buffer.png", alt: "音频接收、音频发送和以太网三个异步 FIFO 的缓存结构", caption: "音频与网络数据的异步缓存结构", width: 875, height: 482},
      },
      {
        id: "equalizer", title: "IIR 滤波与六段均衡器", english: "FILTERING & SIX-BAND EQUALIZATION",
        description: "将频率响应调节落实为可在 FPGA 中运行的滤波链路。通过搁置滤波器与峰值滤波器的组合，对不同音频频段进行增益控制。",
        points: [
          "以二阶 IIR 结构组织滤波运算，在逻辑资源约束下完成频率选择与音色调整。",
          "低频与高频段使用搁置滤波器，中间频段采用峰值滤波器，形成六段均衡控制。",
          "支持预设参数与上位机动态调节，能够结合输入输出频谱观察增益设置带来的变化。",
        ],
      },
      {
        id: "echo-reverb", title: "可调回声与 Schroeder 混响", english: "ECHO & REVERBERATION",
        description: "通过延迟、衰减与反馈结构在数字域构造空间感。回声强调可调节的延迟重复，混响则利用多级滤波网络形成更密集的反射效果。",
        points: [
          "回声由原始信号和延迟衰减分量叠加，上位机支持 0–100 ms 延迟配置。",
          "采用四个梳状滤波器并联、两个全通滤波器串联的 Schroeder 结构组织混响。",
          "结合缓存深度与延迟参数管理存储开销，将算法中的延迟单元映射到实际硬件资源。",
        ],
        diagram: {src: "/images/diagrams/audio-reverb.png", alt: "四路梳状滤波器并联后连接两级全通滤波器的 Schroeder 混响框图", caption: "Schroeder 混响处理框图", width: 1446, height: 837},
      },
      {
        id: "resampling", title: "多倍率采样率转换", english: "MULTIRATE SIGNAL PROCESSING",
        description: "在保持数据链路可控的前提下实现升采样与降采样，让同一系统支持不同输出采样率的处理需求。",
        points: [
          "使用二阶 CIC 结构实现升采样，以积分器、梳状滤波器及延迟单元组织运算，降低乘法资源依赖。",
          "技术文稿记录了 2、4、8、16 倍升采样，以及 2、4 倍降采样。",
          "通过采样率相关时钟和播放链路联调，对实际输入输出采样率进行验证。",
        ],
        diagram: {src: "/images/diagrams/audio-cic.png", alt: "由积分器和梳状滤波器级联组成的 CIC 升采样逻辑结构", caption: "CIC 采样率转换结构", width: 1170, height: 419},
      },
      {
        id: "control", title: "UART 协议解析与交互控制", english: "COMMAND PROTOCOL & CONTROL",
        description: "将音效参数从固定逻辑扩展为可交互配置，建立上位机指令到 FPGA 内部处理参数的控制路径。",
        points: [
          "组织串口接收、数据包解析、返回打包和串口发送模块，解析帧头、命令、有效长度、数据及校验。",
          "对错误帧头、无效命令、长度与校验异常返回对应状态，便于确认控制指令是否正确执行。",
          "结合按键消抖和功能选择，支持本地切换与上位机调节两种交互方式。",
        ],
        diagram: {src: "/images/diagrams/audio-uart.png", alt: "串口收发、数据包解析、应答打包与顶层控制的模块框图", caption: "UART 指令收发与解析框图", width: 1229, height: 554},
      },
      {
        id: "visualization", title: "FFT、UDP 与波形可视化", english: "SIGNAL ANALYSIS & VISUALIZATION",
        description: "为音频处理链路补上可观察的反馈通道。通过 FPGA 数据处理、UDP 传输和图形界面，将音效变化转化为时域与频域信息。",
        points: [
          "结合高云 FFT IP 与幅值处理组织频谱分析支路，为音频频率成分的观察提供数据基础。",
          "通过数据缓存、UDP 收发和 GMII / RGMII 接口连接上位机，完成音频相关数据传输。",
          "上位机以波形和频谱展示处理结果，并提供回声延迟、均衡器增益等参数的交互控制。",
        ],
        diagram: {src: "/images/diagrams/audio-network.png", alt: "音频数据缓存、UDP 收发控制以及 GMII 与 RGMII 接口的以太网传输框图", caption: "音频数据的以太网传输结构", width: 752, height: 455},
      },
    ],
    highlights: [
      {title: "把算法落实到连续工作的硬件链路", description: "将滤波、延迟、反馈与采样率转换落实为缓存、算术运算和控制逻辑，覆盖从算法结构到接口时序、再到实际播放的联调过程。"},
      {title: "在资源约束下组织多种音效", description: "利用 IIR、CIC 和模块复用等结构选择，在有限的 FPGA 逻辑与片上存储资源中集成多类处理功能，体现运算开销、缓存深度与功能覆盖之间的取舍。"},
      {title: "让处理效果可听、可调、可观察", description: "音频输出、UART 参数控制与上位机可视化相互配合，为处理算法提供更直接的调试反馈，而不只依赖听感判断。"},
    ],
    metrics: [{value: "0–100 ms", label: "可调回声延迟"}, {value: "6 段", label: "均衡器频段控制"}, {value: "16×", label: "文稿记录的最高升采样倍率"}],
    resultNote: "获第七届全国大学生嵌入式芯片与系统设计竞赛 FPGA 创新设计赛道全国二等奖。功能范围与参数依据团队技术文稿及演示材料整理。",
  },
};
