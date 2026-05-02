import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Zap,
  Shield,
  Target,
  Rocket,
  AlertTriangle,
  Star,
  Flame,
  Sparkles,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import DynamicNeuroverseModa from "./DynamicNeuroverseModa";
import { Link } from "react-router-dom";

export default function DynamicNeuroverse() {
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const updateIntervalRef = useRef(null);
  const [gameState, setGameState] = useState("menu");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [realAsteroids, setRealAsteroids] = useState([]);
  const [gameAsteroids, setGameAsteroids] = useState([]);
  const [projectiles, setProjectiles] = useState([]);
  const [powerUps, setPowerUps] = useState([]);
  const [particles, setParticles] = useState([]);
  const [stars, setStars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState("2025-07-19");
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [dataStatus, setDataStatus] = useState("idle"); // 'idle', 'loading', 'success', 'error'
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [weaponType, setWeaponType] = useState("normal");
  const [weaponCooldown, setWeaponCooldown] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [lastHitTime, setLastHitTime] = useState(0);
  const [screenShake, setScreenShake] = useState(0);
  const [backgroundSpeed, setBackgroundSpeed] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const openModal = () => setIsOpen(true);

  // Enhanced player state
  const [player, setPlayer] = useState({
    x: 400,
    y: 500,
    width: 40,
    height: 40,
    shield: 0,
    speed: 5,
    weaponLevel: 1,
  });
  const [keys, setKeys] = useState({});

  // Initialize animated star field
  useEffect(() => {
    const newStars = Array.from({ length: 200 }, (_, i) => ({
      id: i,
      x: Math.random() * 800,
      y: Math.random() * 600,
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 2 + 0.5,
      twinkle: Math.random() * Math.PI * 2,
    }));
    setStars(newStars);
  }, []);

  // Enhanced NASA data fetching with automatic updates
  const fetchAsteroidData = async (autoDate = null, isAutoUpdate = false) => {
    if (!isAutoUpdate) setLoading(true);
    setDataStatus("loading");

    try {
      const dateToUse = autoDate || selectedDate;
      const response = await fetch(
        `https://api.nasa.gov/neo/rest/v1/feed?start_date=${dateToUse}&end_date=${dateToUse}&api_key=RKJbtzxu1bP3UT08OAVQb3wYDwkgddc7oLCguh57`
      );
      const data = await response.json();

      if (data?.near_earth_objects?.[dateToUse]) {
        const newAsteroids = data.near_earth_objects[dateToUse];
        setRealAsteroids(newAsteroids);
        setLastUpdateTime(new Date());
        setDataStatus("success");

        // If no asteroids found, try previous day
        if (newAsteroids.length === 0) {
          const prevDate = new Date(dateToUse);
          prevDate.setDate(prevDate.getDate() - 1);
          const prevDateStr = prevDate.toISOString().split("T")[0];
          setSelectedDate(prevDateStr);
          fetchAsteroidData(prevDateStr, isAutoUpdate);
          return;
        }
      }
    } catch (error) {
      console.error("Failed to fetch asteroid data:", error);
      setDataStatus("error");
      // Fallback to mock data for demo
      setRealAsteroids([
        {
          id: "demo1",
          name: "Demo Asteroid Alpha",
          estimated_diameter: { meters: { estimated_diameter_max: 100 } },
          close_approach_data: [
            {
              relative_velocity: { kilometers_per_hour: 50000 },
              miss_distance: { kilometers: "1500000" },
            },
          ],
          is_potentially_hazardous_asteroid: true,
        },
        {
          id: "demo2",
          name: "Demo Asteroid Beta",
          estimated_diameter: { meters: { estimated_diameter_max: 50 } },
          close_approach_data: [
            {
              relative_velocity: { kilometers_per_hour: 30000 },
              miss_distance: { kilometers: "2500000" },
            },
          ],
          is_potentially_hazardous_asteroid: false,
        },
      ]);
      setLastUpdateTime(new Date());
    }

    setLoading(false);
  };

  // Auto-fetch latest data and set up automatic updates
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
    fetchAsteroidData(today);

    // Set up automatic updates every 15 minutes
    if (autoUpdate) {
      updateIntervalRef.current = setInterval(() => {
        const currentDate = new Date().toISOString().split("T")[0];
        fetchAsteroidData(currentDate, true);
      }, 15 * 60 * 1000); // 15 minutes
    }

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [autoUpdate]);

  // Create particles for explosions and effects
  const createParticles = (x, y, count, type = "explosion") => {
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      life: 1.0,
      maxLife: 1.0,
      size: Math.random() * 4 + 2,
      type: type,
      color:
        type === "explosion"
          ? `hsl(${Math.random() * 60 + 15}, 100%, 50%)`
          : type === "powerup"
          ? `hsl(${Math.random() * 360}, 100%, 50%)`
          : `hsl(200, 100%, 70%)`,
    }));
    setParticles((prev) => [...prev, ...newParticles]);
  };

  // Enhanced asteroid creation with dynamic properties
  const createGameAsteroids = useCallback(() => {
    if (realAsteroids.length === 0) return [];

    const asteroidsToSpawn = Math.min(3 + level, realAsteroids.length);
    return realAsteroids.slice(0, asteroidsToSpawn).map((asteroid, index) => {
      const diameter =
        asteroid.estimated_diameter?.meters?.estimated_diameter_max || 50;
      const baseSpeed = Math.min(
        asteroid.close_approach_data?.[0]?.relative_velocity
          ?.kilometers_per_hour / 10000 || 1,
        3
      );
      const hazardous = asteroid.is_potentially_hazardous_asteroid;
      const size = Math.max(20, Math.min(diameter / 3, 100));

      return {
        id: asteroid.id,
        name: asteroid.name,
        x: Math.random() * (800 - size),
        y: -50 - index * 120,
        width: size,
        height: size,
        vx: (Math.random() - 0.5) * 3,
        vy: baseSpeed + level * 0.3 + Math.random() * 2,
        health: hazardous ? Math.ceil(level / 2) + 2 : 1,
        maxHealth: hazardous ? Math.ceil(level / 2) + 2 : 1,
        hazardous: hazardous,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        trail: [],
        specialType:
          Math.random() < 0.2
            ? Math.random() < 0.5
              ? "split"
              : "shield"
            : null,
        realData: asteroid,
      };
    });
  }, [realAsteroids, level]);

  // Power-up system
  const spawnPowerUp = (x, y) => {
    if (Math.random() < 0.3) {
      const powerUpTypes = ["rapid", "triple", "shield", "nuke"];
      const type =
        powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];

      setPowerUps((prev) => [
        ...prev,
        {
          id: Date.now(),
          x: x,
          y: y,
          width: 30,
          height: 30,
          type: type,
          vy: 2,
          pulse: 0,
        },
      ]);
    }
  };

  // Enhanced weapon system
  const shoot = () => {
    if (weaponCooldown > 0) return;

    const baseProjectile = {
      x: player.x + player.width / 2 - 2,
      y: player.y,
      width: 4,
      height: 10,
      vy: -12,
      damage: 1,
      type: weaponType,
    };

    let newProjectiles = [];

    switch (weaponType) {
      case "triple":
        newProjectiles = [
          { ...baseProjectile, vx: -2 },
          { ...baseProjectile, vx: 0 },
          { ...baseProjectile, vx: 2 },
        ];
        setWeaponCooldown(8);
        break;
      case "rapid":
        newProjectiles = [{ ...baseProjectile, vy: -15 }];
        setWeaponCooldown(3);
        break;
      case "laser":
        newProjectiles = [
          {
            ...baseProjectile,
            width: 6,
            height: 600,
            vy: 0,
            damage: 3,
            laser: true,
          },
        ];
        setWeaponCooldown(60);
        break;
      default:
        newProjectiles = [baseProjectile];
        setWeaponCooldown(6);
    }

    setProjectiles((prev) => [...prev, ...newProjectiles]);

    // Screen shake for powerful weapons
    if (weaponType === "laser") {
      setScreenShake(10);
    }
  };

  // Game initialization with enhanced features
  const initGame = () => {
    setScore(0);
    setLives(3);
    setLevel(1);
    setComboMultiplier(1);
    setWeaponType("normal");
    setWeaponCooldown(0);
    setScreenShake(0);
    setBackgroundSpeed(1);
    setGameAsteroids(createGameAsteroids());
    setProjectiles([]);
    setPowerUps([]);
    setParticles([]);
    setPlayer({
      x: 400,
      y: 500,
      width: 40,
      height: 40,
      shield: 0,
      speed: 5,
      weaponLevel: 1,
    });
    setGameState("playing");
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      setKeys((prev) => ({ ...prev, [e.key]: true }));
      if (e.key === " " && gameState === "playing") {
        e.preventDefault();
        shoot();
      }
    };

    const handleKeyUp = (e) => {
      setKeys((prev) => ({ ...prev, [e.key]: false }));
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState, weaponType, weaponCooldown]);

  // Collision detection with enhanced effects
  const checkCollision = (rect1, rect2) => {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  };

  // Enhanced game update logic
  const updateGame = useCallback(() => {
    if (gameState !== "playing") return;

    // Update cooldowns and effects
    setWeaponCooldown((prev) => Math.max(0, prev - 1));
    setScreenShake((prev) => Math.max(0, prev - 1));
    setPlayer((prev) => ({ ...prev, shield: Math.max(0, prev.shield - 1) }));

    // Update combo multiplier
    const now = Date.now();
    if (now - lastHitTime > 3000) {
      setComboMultiplier(1);
    }

    // Update background speed based on level
    setBackgroundSpeed(1 + level * 0.2);

    // Update stars
    setStars((prev) =>
      prev.map((star) => ({
        ...star,
        y: (star.y + star.speed * backgroundSpeed) % 600,
        twinkle: star.twinkle + 0.1,
      }))
    );

    // Update particles
    setParticles((prev) =>
      prev
        .map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          life: p.life - 0.02,
          vy: p.vy + 0.1,
        }))
        .filter((p) => p.life > 0)
    );

    // Update player position with enhanced movement
    setPlayer((prev) => {
      let newX = prev.x;
      let newY = prev.y;
      const speed = prev.speed + (keys["Shift"] ? 3 : 0);

      if (keys["ArrowLeft"] || keys["a"]) newX = Math.max(0, prev.x - speed);
      if (keys["ArrowRight"] || keys["d"]) newX = Math.min(760, prev.x + speed);
      if (keys["ArrowUp"] || keys["w"]) newY = Math.max(400, prev.y - speed);
      if (keys["ArrowDown"] || keys["s"]) newY = Math.min(560, prev.y + speed);

      return { ...prev, x: newX, y: newY };
    });

    // Update projectiles with enhanced effects
    setProjectiles((prev) =>
      prev
        .map((p) => ({
          ...p,
          x: p.x + (p.vx || 0),
          y: p.y + p.vy,
        }))
        .filter((p) => p.y > -50 && (!p.laser || p.y < 650))
    );

    // Update power-ups
    setPowerUps((prev) =>
      prev
        .map((p) => ({ ...p, y: p.y + p.vy, pulse: p.pulse + 0.2 }))
        .filter((p) => p.y < 650)
    );

    // Check power-up collection
    setPowerUps((prev) => {
      const remaining = [];
      prev.forEach((powerUp) => {
        if (checkCollision(powerUp, player)) {
          createParticles(powerUp.x + 15, powerUp.y + 15, 15, "powerup");

          switch (powerUp.type) {
            case "rapid":
              setWeaponType("rapid");
              setTimeout(() => setWeaponType("normal"), 10000);
              break;
            case "triple":
              setWeaponType("triple");
              setTimeout(() => setWeaponType("normal"), 8000);
              break;
            case "shield":
              setPlayer((prev) => ({ ...prev, shield: 300 }));
              break;
            case "nuke":
              setGameAsteroids((prev) => {
                prev.forEach((asteroid) => {
                  createParticles(
                    asteroid.x + asteroid.width / 2,
                    asteroid.y + asteroid.height / 2,
                    20
                  );
                });
                setScore((s) => s + prev.length * 500 * comboMultiplier);
                return [];
              });
              setWeaponType("laser");
              setTimeout(() => setWeaponType("normal"), 5000);
              break;
          }
        } else {
          remaining.push(powerUp);
        }
      });
      return remaining;
    });

    // Update asteroids with enhanced behavior
    setGameAsteroids((prev) => {
      let newAsteroids = prev
        .map((asteroid) => ({
          ...asteroid,
          x: asteroid.x + asteroid.vx,
          y: asteroid.y + asteroid.vy,
          rotation: asteroid.rotation + asteroid.rotationSpeed,
          trail: [
            ...(asteroid.trail || []),
            { x: asteroid.x, y: asteroid.y },
          ].slice(-8),
        }))
        .filter((asteroid) => asteroid.y < 650 && asteroid.health > 0);

      // Check collisions with projectiles
      setProjectiles((prevProjectiles) => {
        let remainingProjectiles = [...prevProjectiles];

        newAsteroids = newAsteroids
          .map((asteroid) => {
            let hitAsteroid = { ...asteroid };

            remainingProjectiles = remainingProjectiles.filter((projectile) => {
              if (checkCollision(projectile, asteroid)) {
                hitAsteroid.health -= projectile.damage || 1;

                const scoreGain =
                  (asteroid.hazardous ? 200 : 100) * comboMultiplier;
                setScore((prev) => prev + scoreGain);
                setComboMultiplier((prev) => Math.min(prev + 0.1, 5));
                setLastHitTime(Date.now());

                // Create explosion particles
                createParticles(
                  asteroid.x + asteroid.width / 2,
                  asteroid.y + asteroid.height / 2,
                  hitAsteroid.health <= 0 ? 25 : 10
                );

                // Screen shake for large asteroids
                if (asteroid.width > 60) {
                  setScreenShake(5);
                }

                // Split asteroid if it has split type
                if (
                  hitAsteroid.health <= 0 &&
                  asteroid.specialType === "split" &&
                  asteroid.width > 40
                ) {
                  const fragments = 2;
                  for (let i = 0; i < fragments; i++) {
                    newAsteroids.push({
                      ...asteroid,
                      id: asteroid.id + "_fragment_" + i,
                      x: asteroid.x + i * 20,
                      y: asteroid.y,
                      width: asteroid.width / 2,
                      height: asteroid.height / 2,
                      vx: (Math.random() - 0.5) * 6,
                      vy: asteroid.vy + 1,
                      health: 1,
                      maxHealth: 1,
                      specialType: null,
                    });
                  }
                }

                // Spawn power-up chance
                if (hitAsteroid.health <= 0) {
                  spawnPowerUp(
                    asteroid.x + asteroid.width / 2,
                    asteroid.y + asteroid.height / 2
                  );
                }

                return projectile.laser ? true : false;
              }
              return true;
            });

            return hitAsteroid;
          })
          .filter((asteroid) => asteroid.health > 0);

        return remainingProjectiles;
      });

      // Check collisions with player (with shield consideration)
      newAsteroids.forEach((asteroid) => {
        if (checkCollision(asteroid, player)) {
          if (player.shield <= 0) {
            setLives((prev) => {
              const newLives = prev - 1;
              if (newLives <= 0) {
                setGameState("gameOver");
              }
              return newLives;
            });
            createParticles(player.x + 20, player.y + 20, 30);
            setScreenShake(15);
          }
          asteroid.health = 0;
        }
      });

      return newAsteroids.filter((asteroid) => asteroid.health > 0);
    });

    // Level progression
    setGameAsteroids((prev) => {
      if (prev.length === 0 && gameState === "playing") {
        setLevel((prevLevel) => {
          const newLevel = prevLevel + 1;
          createParticles(400, 300, 50, "levelup");
          setTimeout(() => {
            setGameAsteroids(createGameAsteroids());
          }, 2000);
          return newLevel;
        });
      }
      return prev;
    });
  }, [
    gameState,
    keys,
    player,
    createGameAsteroids,
    comboMultiplier,
    lastHitTime,
  ]);

  // Game loop
  useEffect(() => {
    if (gameState === "playing") {
      gameLoopRef.current = setInterval(updateGame, 1000 / 60);
    } else {
      clearInterval(gameLoopRef.current);
    }

    return () => clearInterval(gameLoopRef.current);
  }, [gameState, updateGame]);

  // Enhanced canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 800, 600);

    // Apply screen shake
    if (screenShake > 0) {
      ctx.save();
      ctx.translate(
        (Math.random() - 0.5) * screenShake,
        (Math.random() - 0.5) * screenShake
      );
    }

    // Draw dynamic space background
    const gradient = ctx.createLinearGradient(0, 0, 0, 600);
    gradient.addColorStop(0, "#000022");
    gradient.addColorStop(0.5, "#000011");
    gradient.addColorStop(1, "#000033");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 600);

    // Draw animated stars
    stars.forEach((star) => {
      const alpha = 0.5 + 0.5 * Math.sin(star.twinkle);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fillRect(star.x, star.y, star.size, star.size);
    });

    if (gameState === "playing") {
      // Draw particles
      particles.forEach((particle) => {
        const alpha = particle.life / particle.maxLife;
        ctx.fillStyle = particle.color
          .replace(")", `, ${alpha})`)
          .replace("hsl", "hsla");
        ctx.fillRect(
          particle.x - particle.size / 2,
          particle.y - particle.size / 2,
          particle.size,
          particle.size
        );
      });

      // Draw player with enhanced effects
      if (player.shield > 0) {
        const shieldAlpha = Math.sin(Date.now() * 0.01) * 0.3 + 0.4;
        ctx.fillStyle = `rgba(0, 255, 255, ${shieldAlpha})`;
        ctx.fillRect(
          player.x - 5,
          player.y - 5,
          player.width + 10,
          player.height + 10
        );
      }

      ctx.fillStyle = "#00ff88";
      ctx.fillRect(player.x, player.y, player.width, player.height);

      // Player weapon glow
      if (weaponType !== "normal") {
        const glowColor =
          weaponType === "rapid"
            ? "#ffff00"
            : weaponType === "triple"
            ? "#ff00ff"
            : "#ff0000";
        ctx.fillStyle = glowColor;
        ctx.fillRect(player.x + 15, player.y - 15, 10, 12);
      }

      // Draw projectiles with trails
      projectiles.forEach((p) => {
        if (p.laser) {
          const gradient = ctx.createLinearGradient(p.x, 0, p.x + p.width, 0);
          gradient.addColorStop(0, "rgba(255, 0, 0, 0.8)");
          gradient.addColorStop(0.5, "rgba(255, 255, 0, 1)");
          gradient.addColorStop(1, "rgba(255, 0, 0, 0.8)");
          ctx.fillStyle = gradient;
          ctx.fillRect(p.x, 0, p.width, 600);
        } else {
          const color =
            weaponType === "rapid"
              ? "#ffff00"
              : weaponType === "triple"
              ? "#ff00ff"
              : "#00ffff";
          ctx.fillStyle = color;
          ctx.fillRect(p.x, p.y, p.width, p.height);

          // Projectile trail
          ctx.fillStyle = color.replace(")", ", 0.3)").replace("rgb", "rgba");
          ctx.fillRect(p.x, p.y + 10, p.width, p.height);
        }
      });

      // Draw power-ups with pulse effect
      powerUps.forEach((powerUp) => {
        const scale = 1 + 0.2 * Math.sin(powerUp.pulse);
        const size = 30 * scale;
        const colors = {
          rapid: "#ffff00",
          triple: "#ff00ff",
          shield: "#00ffff",
          nuke: "#ff0000",
        };

        ctx.fillStyle = colors[powerUp.type];
        ctx.fillRect(
          powerUp.x + 15 - size / 2,
          powerUp.y + 15 - size / 2,
          size,
          size
        );
      });

      // Draw asteroids with enhanced effects
      gameAsteroids.forEach((asteroid) => {
        // Draw trail
        if (asteroid.trail && asteroid.trail.length > 1) {
          ctx.strokeStyle = asteroid.hazardous
            ? "rgba(255, 68, 68, 0.3)"
            : "rgba(136, 136, 136, 0.3)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          asteroid.trail.forEach((point, i) => {
            if (i === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
          });
          ctx.stroke();
        }

        ctx.save();
        ctx.translate(
          asteroid.x + asteroid.width / 2,
          asteroid.y + asteroid.height / 2
        );
        ctx.rotate(asteroid.rotation);

        // Asteroid color based on type
        let color = asteroid.hazardous ? "#ff4444" : "#888888";
        if (asteroid.specialType === "split") color = "#ffaa00";
        if (asteroid.specialType === "shield") color = "#00aaff";

        ctx.fillStyle = color;
        ctx.fillRect(
          -asteroid.width / 2,
          -asteroid.height / 2,
          asteroid.width,
          asteroid.height
        );

        // Special effects
        if (asteroid.hazardous) {
          const pulse = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
          ctx.fillStyle = `rgba(255, 0, 0, ${pulse * 0.3})`;
          ctx.fillRect(
            -asteroid.width / 2 - 5,
            -asteroid.height / 2 - 5,
            asteroid.width + 10,
            asteroid.height + 10
          );
        }

        ctx.restore();

        // Health bar for multi-hit asteroids
        if (asteroid.maxHealth > 1) {
          const barWidth = asteroid.width;
          const barHeight = 6;
          ctx.fillStyle = "#ff0000";
          ctx.fillRect(asteroid.x, asteroid.y - 12, barWidth, barHeight);
          ctx.fillStyle = "#00ff00";
          ctx.fillRect(
            asteroid.x,
            asteroid.y - 12,
            (asteroid.health / asteroid.maxHealth) * barWidth,
            barHeight
          );
        }
      });
    }

    if (screenShake > 0) {
      ctx.restore();
    }
  });

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white p-2">
      <div className="max-w-7xl w-full">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          🚀 DYNAMIC ASTEROID DEFENSE: NASA EDITION
        </h1>

        <DynamicNeuroverseModa isOpen={isOpen} setIsOpen={setIsOpen} />

        {gameState === "menu" && (
          <div className="flex flex-col lg:flex-row gap-4 mb-4 text-xs leading-tight">
            {/* Left Column */}
            <div className="w-full lg:w-2/5 space-y-4">
              {/* Data Status */}
              <div className="bg-gradient-to-br from-purple-950 to-gray-900 p-3 rounded-lg border border-purple-500 shadow-md">
                <h3 className="text-sm font-bold mb-2 flex items-center gap-2 text-purple-200">
                  {dataStatus === "loading" && (
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                  )}
                  {dataStatus === "success" && (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  )}
                  {dataStatus === "error" && (
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  )}
                  <Star className="w-4 h-4 text-yellow-400" />
                  Data Status
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span>Asteroids Loaded:</span>
                    <Link
                      to="/rocket_launch_simulator"
                      className="underline text-cyan-300">
                      Asteroids Data
                    </Link>
                    <span className="text-cyan-400 font-bold">
                      {realAsteroids.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span className="text-yellow-400">{selectedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Auto-Update:</span>
                    <span
                      className={
                        autoUpdate ? "text-green-400" : "text-red-400"
                      }>
                      {autoUpdate ? "ON" : "OFF"}
                    </span>
                  </div>
                  {lastUpdateTime && (
                    <div className="flex justify-between">
                      <span>Last Update:</span>
                      <span className="text-blue-400 text-[10px]">
                        {lastUpdateTime.toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Game Features */}
                <div className="mt-3 p-2 bg-gray-800 rounded-md text-xs space-y-1">
                  <p className="text-purple-300 font-bold mb-1 text-center">
                    🌟 Game Features:
                  </p>
                  <div className="grid grid-cols-2 gap-1 text-white text-[11px]">
                    <div className="bg-gray-700 rounded px-1 text-center">
                      🎆 Particle Effects
                    </div>
                    <div className="bg-gray-700 rounded px-1 text-center">
                      ⚡ Power Weapons
                    </div>
                    <div className="bg-gray-700 rounded px-1 text-center">
                      🛡️ Shield System
                    </div>
                    <div className="bg-gray-700 rounded px-1 text-center">
                      💥 Special Asteroids
                    </div>
                    <div className="bg-gray-700 rounded px-1 text-center">
                      🎯 Combo System
                    </div>
                    <div className="bg-gray-700 rounded px-1 text-center">
                      📡 Live NASA Data
                    </div>
                  </div>
                </div>
              </div>

              {/* Game Controls */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-3 rounded-lg border border-blue-500 shadow-sm">
                <h2 className="text-[10px] mb-2 flex items-center gap-2 font-semibold text-white">
                  🌌 Game Controls
                  {dataStatus === "success" && (
                    <div className="flex items-center gap-1 text-green-400 text-[9px]">
                      <CheckCircle className="w-3 h-3" />
                      Live Data
                    </div>
                  )}
                </h2>

                <p className="mb-3 text-[9px] text-gray-300 leading-tight">
                  Experience dynamic gameplay with live NASA data!
                </p>

                <div className="mb-2">
                  <label className="block text-[9px] font-medium mb-1 text-gray-300">
                    Date:
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="p-[5px] border border-gray-600 rounded bg-gray-700 text-white text-[10px] w-full"
                  />
                </div>

                <div className="mb-2">
                  <label className="flex items-center gap-2 text-[9px] text-gray-300">
                    <input
                      type="checkbox"
                      checked={autoUpdate}
                      onChange={(e) => setAutoUpdate(e.target.checked)}
                      className="rounded"
                    />
                    Auto-update every 15min
                  </label>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => fetchAsteroidData()}
                    disabled={loading}
                    className="bg-blue-600 text-white px-2 py-[5px] rounded hover:bg-blue-700 disabled:bg-blue-300 text-[10px] transition-all flex items-center gap-2 justify-center">
                    {loading ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3 h-3" />
                        Update Data
                      </>
                    )}
                  </button>

                  {realAsteroids.length > 0 && (
                    <button
                      onClick={initGame}
                      className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-2 py-[6px] rounded hover:from-green-700 hover:to-blue-700 transition-all text-[10px] font-semibold">
                      🎮 LAUNCH GAME
                    </button>
                  )}
                </div>

                {lastUpdateTime && (
                  <div className="mt-2 text-[8.5px] text-gray-400">
                    Last updated: {lastUpdateTime.toLocaleTimeString()}
                  </div>
                )}

                <div className="mt-2 text-[8.5px] text-gray-300 leading-tight">
                  🎮 Features: Particles • Weapons • Combos • Live NASA Data
                </div>
              </div>

              {/* NASA Asteroids Data */}
              <div className="bg-gradient-to-br from-gray-800 to-blue-900 p-2 rounded-md border border-blue-500 shadow-sm">
                <h3 className="text-xs font-bold mb-1 flex items-center gap-1 text-cyan-300">
                  <Sparkles className="w-3 h-3" />
                  NASA Asteroids ({selectedDate})
                </h3>

                {realAsteroids.length > 0 ? (
                  <div className="space-y-1 max-h-52 overflow-y-auto text-[10px] leading-tight pr-1">
                    {realAsteroids.map((asteroid) => {
                      const inGame = gameAsteroids.some(
                        (ga) => ga.id === asteroid.id
                      );
                      const diameter =
                        asteroid.estimated_diameter?.meters
                          ?.estimated_diameter_max || 0;
                      const speed = Math.round(
                        asteroid.close_approach_data?.[0]?.relative_velocity
                          ?.kilometers_per_hour || 0
                      );
                      const distance =
                        asteroid.close_approach_data?.[0]?.miss_distance
                          ?.kilometers;

                      return (
                        <div
                          key={asteroid.id}
                          className={`p-1.5 rounded-sm border-l-2 text-[10px] transition-all ${
                            inGame
                              ? "border-red-400 bg-red-900 bg-opacity-30"
                              : asteroid.is_potentially_hazardous_asteroid
                              ? "border-orange-400 bg-orange-900 bg-opacity-20"
                              : "border-blue-400 bg-blue-900 bg-opacity-20"
                          }`}>
                          <div className="flex justify-between items-start mb-0.5">
                            <span className="font-semibold text-cyan-300 truncate w-4/5">
                              {asteroid.name
                                .replace(/[()]/g, "")
                                .substring(0, 20)}
                              {asteroid.name.length > 20 && "..."}
                            </span>
                            {asteroid.is_potentially_hazardous_asteroid && (
                              <AlertTriangle className="w-3 h-3 text-red-400 flex-shrink-0" />
                            )}
                          </div>

                          <div className="grid grid-cols-3 gap-1 text-gray-300">
                            <div>📏 {diameter.toFixed(0)}m</div>
                            <div>🚀 {speed.toLocaleString()}</div>
                            <div>
                              🌍{" "}
                              {distance
                                ? `${Math.round(parseFloat(distance) / 1000)}k`
                                : "N/A"}
                            </div>
                          </div>

                          {inGame && (
                            <div className="text-red-400 mt-1 font-bold animate-pulse">
                              🎯 ACTIVE
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-3">
                    <RefreshCw className="w-6 h-6 mx-auto mb-1 animate-spin" />
                    <p className="text-[10px]">Loading asteroid data...</p>
                  </div>
                )}

                {realAsteroids.length > 0 && (
                  <div className="mt-1 text-center text-gray-400 text-[10px]">
                    {
                      realAsteroids.filter(
                        (a) => a.is_potentially_hazardous_asteroid
                      ).length
                    }{" "}
                    hazardous • {realAsteroids.length} total
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="w-full lg:w-3/5">
              <div className="bg-gradient-to-br from-gray-800 to-black p-2 rounded-md border border-blue-500 shadow-sm">
                <h3 className="text-xs font-bold mb-1 flex items-center gap-1 justify-center text-cyan-300 tracking-tight">
                  🚀 Game Visualization
                </h3>

                <div className="flex items-center justify-between mb-1 px-1 text-[10px] text-cyan-200">
                  <Link
                    to="/rocket_launch_simulator"
                    className="hover:underline hover:text-blue-300 transition duration-150">
                    Asteroids Data
                  </Link>

                  <button
                    onClick={openModal}
                    className="px-1.5 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[9px] font-medium transition-all duration-150">
                    <Rocket className="w-4 h-4 inline mr-2" />
                    Game Roles
                  </button>
                </div>

                <canvas
                  ref={canvasRef}
                  width={400}
                  height={300}
                  className="border border-gray-600 rounded bg-black shadow w-full"
                  style={{ aspectRatio: "4/3" }}
                />
              </div>
            </div>
          </div>
        )}

        {gameState === "playing" && (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 bg-gradient-to-r from-gray-800 to-gray-900 p-3 rounded-lg border border-blue-500 gap-2">
              <div className="flex flex-wrap gap-2 sm:gap-4 text-sm justify-center sm:justify-start">
                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4 text-yellow-400" />
                  <span>{score.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span>{lives}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Rocket className="w-4 h-4 text-blue-400" />
                  <span>L{level}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span>x{comboMultiplier.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span>{weaponType.toUpperCase()}</span>
                </div>
              </div>
              <button
                onClick={() => setGameState("menu")}
                className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 transition-all text-sm">
                Exit
              </button>
            </div>

            <div className="relative">
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="border-2 border-gray-600 rounded-lg bg-black shadow-2xl w-full max-w-4xl mx-auto"
                style={{ aspectRatio: "4/3" }}
              />

              <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 p-2 rounded text-xs">
                <p className="text-cyan-400 font-bold">🎮 Controls:</p>
                <p>← → ↑ ↓ / WASD: Move</p>
                <p>SPACE: Shoot • SHIFT: Boost</p>

                {gameAsteroids.length > 0 && (
                  <div className="mt-1">
                    <p className="text-yellow-400 font-bold">Active:</p>
                    {gameAsteroids.slice(0, 2).map((asteroid) => (
                      <p
                        key={asteroid.id}
                        className="text-xs flex items-center gap-1">
                        {asteroid.hazardous && (
                          <AlertTriangle className="w-2 h-2 text-red-400" />
                        )}
                        {asteroid.name.substring(0, 15)}...
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <div className="absolute top-2 right-2 bg-black bg-opacity-75 p-2 rounded text-xs">
                <p className="text-purple-400 font-bold">⚡ Weapon:</p>
                <p>{weaponType.toUpperCase()}</p>
                {weaponCooldown > 0 && (
                  <div className="w-16 h-1 bg-gray-600 rounded mt-1">
                    <div
                      className="h-1 bg-yellow-400 rounded transition-all duration-100"
                      style={{
                        width: `${Math.max(
                          0,
                          (1 - weaponCooldown / 60) * 100
                        )}%`,
                      }}
                    />
                  </div>
                )}
                {player.shield > 0 && (
                  <p className="text-cyan-400">
                    🛡️ {Math.ceil(player.shield / 60)}s
                  </p>
                )}
              </div>

              {gameAsteroids.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="text-center">
                    <h3 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-2">
                      LEVEL {level} COMPLETE!
                    </h3>
                    <p className="text-lg text-white">Preparing next wave...</p>
                    <div className="mt-2 flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {gameState === "gameOver" && (
          <div className="text-center bg-gradient-to-br from-black via-red-900 to-gray-900 p-6 md:p-8 rounded-2xl mb-6 border border-red-600 shadow-xl">
            <h2 className="text-3xl font-extrabold text-red-300 mb-4 tracking-wide drop-shadow-md animate-pulse">
              💥 GAME OVER!
            </h2>

            <div className="grid grid-cols-2 gap-4 text-base md:text-lg text-white mb-6 font-medium">
              <div>
                🎯 Final Score:{" "}
                <span className="text-green-300">{score.toLocaleString()}</span>
              </div>
              <div>
                🚀 Level: <span className="text-yellow-300">{level}</span>
              </div>
              <div>
                🔥 Max Combo:{" "}
                <span className="text-pink-400">
                  x{comboMultiplier.toFixed(1)}
                </span>
              </div>
              <div>
                ☄️ Asteroids:{" "}
                <span className="text-blue-300">{realAsteroids.length}</span>
              </div>
            </div>

            <p className="text-red-200 italic mb-6">
              Earth was struck by asteroids... but you can try again, hero!
            </p>

            <button
              onClick={() => setGameState("menu")}
              className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white font-semibold px-6 py-2 rounded-full hover:from-blue-600 hover:to-indigo-700 hover:scale-105 transition duration-200 ease-in-out shadow-md">
              🔁 Return to Menu
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
